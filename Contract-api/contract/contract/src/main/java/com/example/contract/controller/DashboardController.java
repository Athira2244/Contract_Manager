package com.example.contract.controller;

import com.example.contract.repository.ClientRepository;
import com.example.contract.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ContractRepository contractRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        List<com.example.contract.entity.Contract> filteredContracts;
        if ("Admin".equalsIgnoreCase(userRole) || userId == null) {
            filteredContracts = contractRepository.findAll();
        } else {
            filteredContracts = contractRepository.findByCreatedBy(userId);
        }

        long totalContracts = filteredContracts.size();
        long activeContracts = filteredContracts.stream().filter(c -> "Active".equals(c.getStatus())).count();

        BigDecimal totalRevenue = filteredContracts.stream()
                .filter(c -> "Active".equals(c.getStatus()))
                .map(c -> c.getTotalValue() != null ? c.getTotalValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();

        List<com.example.contract.entity.Client> filteredClients;
        if ("Admin".equalsIgnoreCase(userRole) || userId == null) {
            filteredClients = clientRepository.findAll();
        } else {
            filteredClients = clientRepository.findByCreatedBy(userId);
        }

        long totalClients = filteredClients.size();
        long activeClients = filteredClients.stream().filter(c -> "Active".equals(c.getStatus())).count();

        List<com.example.contract.entity.Contract> recentContracts;
        if ("Admin".equalsIgnoreCase(userRole) || userId == null) {
            recentContracts = contractRepository.findTop5ByOrderByIdDesc();
        } else {
            recentContracts = filteredContracts.stream()
                .sorted(java.util.Comparator.comparing(com.example.contract.entity.Contract::getId).reversed())
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        }

        stats.put("totalClients", totalClients);
        stats.put("activeClients", activeClients);
        stats.put("totalContracts", totalContracts);
        stats.put("activeContracts", activeContracts);
        stats.put("totalRevenue", totalRevenue);
        stats.put("recentContracts", recentContracts);

        return stats;
    }
}
