package com.example.contract.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "contract_services")
public class ContractService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    @JsonIgnore
    private Contract contract;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    private Integer employeeCount; // If applicable

    private BigDecimal unitPrice;

    private String frequency; // Monthly, One-time

    private BigDecimal taxPercentage;

    private BigDecimal totalAmount;

    @ManyToMany
    @JoinTable(name = "contract_service_sub_services", joinColumns = @JoinColumn(name = "contract_service_id"), inverseJoinColumns = @JoinColumn(name = "sub_service_id"))
    private java.util.List<SubService> optedSubServices;
}
