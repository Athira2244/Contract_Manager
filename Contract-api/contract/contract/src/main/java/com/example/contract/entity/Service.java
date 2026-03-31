package com.example.contract.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category; // Payroll, Compliance, HRMS, Consulting

    private String pricingType; // Per Employee, Fixed, One-Time, Annual

    private BigDecimal basePrice;

    private String timeSpan; // Monthly, Quarterly, Yearly

    @Column(name = "created_by")
    private String createdBy;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<SubService> subServices;
}
