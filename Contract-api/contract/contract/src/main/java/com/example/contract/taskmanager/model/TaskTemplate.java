package com.example.contract.taskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "task_templates")
@Data
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String defaultDescription;

    private Integer defaultPriority; // 0: Normal, 1: High, 2: Urgent

    @Column(name = "created_by")
    private Integer createdBy;
}
