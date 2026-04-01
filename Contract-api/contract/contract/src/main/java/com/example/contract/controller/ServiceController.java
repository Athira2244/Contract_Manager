package com.example.contract.controller;

import com.example.contract.entity.Service;
import com.example.contract.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private com.example.contract.repository.ServiceRepository serviceRepository;

    @GetMapping
    public List<Service> getAllServices(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if ("Admin".equalsIgnoreCase(userRole)) {
            return serviceService.getAllServices();
        } else if (userId != null) {
            return serviceRepository.findByCreatedBy(userId);
        }
        return serviceService.getAllServices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable("id") Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Service createService(
            @RequestBody Service service,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null) {
            service.setCreatedBy(userId);
        }
        return serviceService.createService(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable("id") Long id, @RequestBody Service serviceDetails) {
        try {
            return ResponseEntity.ok(serviceService.updateService(id, serviceDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable("id") Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok().build();
    }
}
