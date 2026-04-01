package com.example.contract.service;

import com.example.contract.entity.Service;
import com.example.contract.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    public Service createService(Service service) {
        if (service.getSubServices() != null) {
            service.getSubServices().forEach(ss -> ss.setService(service));
        }
        return serviceRepository.save(service);
    }

    public Service updateService(Long id, Service serviceDetails) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setName(serviceDetails.getName());
        service.setCategory(serviceDetails.getCategory());
        service.setPricingType(serviceDetails.getPricingType());
        service.setBasePrice(serviceDetails.getBasePrice());

        // Handle SubServices
        if (service.getSubServices() != null) {
            service.getSubServices().clear();
            if (serviceDetails.getSubServices() != null) {
                serviceDetails.getSubServices().forEach(ss -> {
                    ss.setService(service);
                    service.getSubServices().add(ss);
                });
            }
        }

        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}
