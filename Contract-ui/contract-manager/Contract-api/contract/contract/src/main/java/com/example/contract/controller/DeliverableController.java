package com.example.contract.controller;

import com.example.contract.entity.Deliverable;
import com.example.contract.repository.DeliverableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/deliverables")
@CrossOrigin(origins = "*")
public class DeliverableController {

    @Autowired
    private DeliverableRepository deliverableRepository;

    @GetMapping("/contract/{contractId}")
    public List<Deliverable> getByContract(@PathVariable("contractId") Long contractId) {
        return deliverableRepository.findByContractId(contractId);
    }

    @GetMapping("/filter")
    public List<Deliverable> getByFilter(
            @RequestParam("month") Integer month, 
            @RequestParam("year") Integer year,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        List<Deliverable> all = deliverableRepository.findByMonthAndYear(month, year);
        if ("Admin".equalsIgnoreCase(userRole) || userId == null) {
            return all;
        }
        return all.stream()
                .filter(d -> d.getContract() != null && userId.equals(d.getContract().getCreatedBy()))
                .collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/status")
    public Deliverable updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        Deliverable d = deliverableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deliverable not found"));
        d.setStatus(status);
        if ("Completed".equalsIgnoreCase(status)) {
            d.setCompletedAt(LocalDate.now());
        }
        return deliverableRepository.save(d);
    }
}
