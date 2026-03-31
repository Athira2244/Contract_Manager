package com.example.contract.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String gstin;

    @Column(unique = true)
    private String pan;

    private String address;

    private String contactPerson;

    private String email;

    private String phone;

    private String assignedSalesPerson;

    private String accountManager;

    @Column(nullable = false)
    private String status = "Active"; // Active, Inactive

    @Column(name = "created_by")
    private String createdBy;
}
