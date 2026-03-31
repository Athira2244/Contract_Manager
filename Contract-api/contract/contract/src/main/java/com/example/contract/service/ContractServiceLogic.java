package com.example.contract.service;

import com.example.contract.entity.Contract;
import com.example.contract.entity.ContractService;
import com.example.contract.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ContractServiceLogic {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private com.example.contract.repository.DeliverableRepository deliverableRepository;

    @Autowired
    private com.example.contract.repository.ServiceRepository serviceRepository;

    @Autowired
    private com.example.contract.repository.SubServiceRepository subServiceRepository;

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    public Optional<Contract> getContractById(Long id) {
        return contractRepository.findById(id);
    }

    public List<Contract> getContractsByClientId(Long clientId) {
        return contractRepository.findByClientId(clientId);
    }

    @Transactional
    public Contract createContract(Contract contract) {
        return calculateAndSave(contract);
    }

    @Transactional
    public Contract updateContract(Long id, Contract updatedContract) {
        Contract existingContract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        existingContract.setClient(updatedContract.getClient());
        existingContract.setStartDate(updatedContract.getStartDate());
        existingContract.setEndDate(updatedContract.getEndDate());
        existingContract.setStatus(updatedContract.getStatus());
        existingContract.setBillingFrequency(updatedContract.getBillingFrequency());
        existingContract.setPaymentTerms(updatedContract.getPaymentTerms());

        // Refresh contract services
        existingContract.getContractServices().clear();
        if (updatedContract.getContractServices() != null) {
            for (ContractService cs : updatedContract.getContractServices()) {
                cs.setContract(existingContract);
                existingContract.getContractServices().add(cs);
            }
        }

        // Recalculate totals using the private helper/logic in create (refactored here)
        return calculateAndSave(existingContract);
    }

    @Transactional
    public void deleteContract(Long id) {
        contractRepository.deleteById(id);
    }

    private Contract calculateAndSave(Contract contract) {
        BigDecimal totalContractValue = BigDecimal.ZERO;
        long months = 1;

        if (contract.getStartDate() != null && contract.getEndDate() != null) {
            months = java.time.temporal.ChronoUnit.MONTHS.between(
                    contract.getStartDate().withDayOfMonth(1),
                    contract.getEndDate().withDayOfMonth(1).plusMonths(1));
            if (months <= 0)
                months = 1;
        }

        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                cs.setContract(contract);
                
                BigDecimal lineItemTotal = BigDecimal.ZERO;
                if (cs.getOptedSubServices() != null && !cs.getOptedSubServices().isEmpty()) {
                    for (com.example.contract.entity.SubService ss : cs.getOptedSubServices()) {
                        com.example.contract.entity.SubService dbSs = subServiceRepository.findById(ss.getId()).orElse(ss);
                        if (dbSs.getPrice() != null) {
                            lineItemTotal = lineItemTotal.add(dbSs.getPrice());
                        }
                    }
                    cs.setUnitPrice(lineItemTotal);
                } else {
                    lineItemTotal = cs.getUnitPrice() != null ? cs.getUnitPrice() : BigDecimal.ZERO;
                    if (lineItemTotal.compareTo(BigDecimal.ZERO) == 0) {
                        com.example.contract.entity.Service service = cs.getService();
                        if (service != null && service.getId() != null) {
                            service = serviceRepository.findById(service.getId()).orElse(service);
                            lineItemTotal = service.getBasePrice() != null ? service.getBasePrice() : BigDecimal.ZERO;
                        }
                    }
                    cs.setUnitPrice(lineItemTotal);
                }

                if ("Monthly".equalsIgnoreCase(cs.getFrequency())
                        || (cs.getService() != null && "Monthly".equalsIgnoreCase(cs.getService().getPricingType()))) {
                    lineItemTotal = lineItemTotal.multiply(new BigDecimal(months));
                }
                cs.setTotalAmount(lineItemTotal);
                totalContractValue = totalContractValue.add(lineItemTotal);
            }
        }
        contract.setTotalValue(totalContractValue);
        Contract savedContract = contractRepository.save(contract);

        // Generate Deliverables
        generateDeliverablesForContract(savedContract);

        return savedContract;
    }

    private void generateDeliverablesForContract(Contract contract) {
        if (contract.getContractServices() == null)
            return;

        for (ContractService cs : contract.getContractServices()) {
            com.example.contract.entity.Service service = cs.getService();
            if (service == null || service.getId() == null) continue;
            
            // Fetch full entity to get timeSpan
            service = serviceRepository.findById(service.getId()).orElse(service);

            boolean hasOptedSubServices = cs.getOptedSubServices() != null && !cs.getOptedSubServices().isEmpty();

            if (hasOptedSubServices) {
                // Case 1: Service HAS sub-services -> Treat as container, only generate sub-service deliverables
                for (com.example.contract.entity.SubService ss : cs.getOptedSubServices()) {
                    if (ss.getId() != null) {
                        com.example.contract.entity.SubService fullSs = subServiceRepository.findById(ss.getId()).orElse(ss);
                        if (fullSs.getTimeSpan() != null) {
                            createDeliverables(contract, service, fullSs, fullSs.getTimeSpan());
                        }
                    }
                }
            } else {
                // Case 2: Service has NO sub-services -> Generate deliverables for the service itself
                if (service.getTimeSpan() != null) {
                    createDeliverables(contract, service, null, service.getTimeSpan());
                }
            }
        }
    }

    private void createDeliverables(Contract contract, com.example.contract.entity.Service service,
            com.example.contract.entity.SubService subService, String timeSpan) {
        LocalDate current = contract.getStartDate();
        LocalDate end = contract.getEndDate();

        int incrementMonths = 1;
        if ("Quarterly".equalsIgnoreCase(timeSpan))
            incrementMonths = 3;
        else if ("Yearly".equalsIgnoreCase(timeSpan) || "Annually".equalsIgnoreCase(timeSpan))
            incrementMonths = 12;

        while (!current.isAfter(end)) {
            com.example.contract.entity.Deliverable d = new com.example.contract.entity.Deliverable();
            d.setContract(contract);
            d.setService(service);
            d.setSubService(subService);
            d.setMonth(current.getMonthValue());
            d.setYear(current.getYear());
            d.setDueDate(current.plusMonths(incrementMonths).withDayOfMonth(5)); // Due by 5th of next period
            d.setStatus("Pending");
            deliverableRepository.save(d);

            current = current.plusMonths(incrementMonths);
        }
    }

    public Contract updateContractStatus(Long id, String status) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        contract.setStatus(status);
        return contractRepository.save(contract);
    }

    public List<Contract> getExpiringContracts() {
        LocalDate today = LocalDate.now();
        LocalDate sixtyDaysFromNow = today.plusDays(60);
        return contractRepository.findByEndDateBetween(today, sixtyDaysFromNow);
    }
}
