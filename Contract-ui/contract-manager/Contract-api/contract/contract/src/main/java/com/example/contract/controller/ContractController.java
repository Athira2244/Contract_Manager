package com.example.contract.controller;

import com.example.contract.entity.Contract;
import com.example.contract.service.ContractServiceLogic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {

    @Autowired
    private ContractServiceLogic contractService;

    @Autowired
    private com.example.contract.repository.ContractRepository contractRepository;

    @GetMapping
    public List<Contract> getAllContracts(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if ("Admin".equalsIgnoreCase(userRole)) {
            return contractService.getAllContracts();
        } else if (userId != null) {
            return contractRepository.findByCreatedBy(userId);
        }
        return contractService.getAllContracts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable("id") Long id) {
        return contractService.getContractById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Contract> getContractsByClientId(@PathVariable("clientId") Long clientId) {
        return contractService.getContractsByClientId(clientId);
    }

    @PostMapping
    public Contract createContract(
            @RequestBody Contract contract,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null) {
            contract.setCreatedBy(userId);
        }
        return contractService.createContract(contract);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contract> updateContract(@PathVariable("id") Long id, @RequestBody Contract contract) {
        try {
            return ResponseEntity.ok(contractService.updateContract(id, contract));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable("id") Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Contract> updateContractStatus(@PathVariable("id") Long id, @RequestBody String status) {
        try {
            return ResponseEntity.ok(contractService.updateContractStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/expiring")
    public List<Contract> getExpiringContracts() {
        return contractService.getExpiringContracts();
    }
}
