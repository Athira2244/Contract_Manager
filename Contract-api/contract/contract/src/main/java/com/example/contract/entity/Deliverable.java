package com.example.contract.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "deliverables")
public class Deliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @ManyToOne
    @JoinColumn(name = "sub_service_id")
    private SubService subService;

    private Integer month; // 1-12
    private Integer year;
    private LocalDate dueDate;

    private String status = "Pending"; // Pending, Completed, Overdue

    @Column(name = "completed_at")
    private LocalDate completedAt;

    private String remarks;
}
