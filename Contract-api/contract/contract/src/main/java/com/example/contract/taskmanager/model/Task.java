package com.example.contract.taskmanager.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long id;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (status == null)
            status = 0;
        if (isAssignee == null)
            isAssignee = 1;
    }

    private Integer status;

    @Column(name = "attachment")
    private String attachment;

    private String taskName;

    private String description;
    private LocalDateTime deadline;

    @Column(name = "assignee_id")
    private Integer assigneeId;

    @Column(name = "EmpName")
    private String empName;

    @Column(name = "is_assignee")
    private Integer isAssignee = 1;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_by_name")
    private String createdByName;

    @Column(name = "pending_date")
    private LocalDateTime pendingDate;

    @Column(name = "in_progress_date")
    private LocalDateTime inProgressDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "contract_id")
    private Long contractId;

    private Integer priority; // 0: Normal, 1: High, 2: Urgent

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getPendingDate() {
        return pendingDate;
    }

    public void setPendingDate(LocalDateTime pendingDate) {
        this.pendingDate = pendingDate;
    }

    public LocalDateTime getInProgressDate() {
        return inProgressDate;
    }

    public void setInProgressDate(LocalDateTime inProgressDate) {
        this.inProgressDate = inProgressDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Integer assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAttachment() {
        return attachment;
    }

    public void setAttachment(String attachment) {
        this.attachment = attachment;
    }

    public Integer getIsAssignee() {
        return isAssignee;
    }

    public void setIsAssignee(Integer isAssignee) {
        this.isAssignee = isAssignee;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
