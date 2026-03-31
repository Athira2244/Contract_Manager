package com.example.contract.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class TaskRequest {

    @JsonProperty("taskName")
    private String taskName;

    @JsonProperty("description")
    private String description;

    @JsonProperty("status")
    private Integer status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime deadline;

    @JsonProperty("empName")
    private String empName;

    @JsonProperty("createdBy")
    private Integer createdBy;

    @JsonProperty("assigneeId")
    private Integer assigneeId;

    @JsonProperty("createdByName")
    private String createdByName;

    @JsonProperty("checklistTemplateId")
    private Long checklistTemplateId;

    @JsonProperty("checklistItems")
    private List<String> checklistItems;

    @JsonProperty("contractId")
    private Long contractId;

    // ✅ Getters
    public String getTaskName() {
        return taskName;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public Integer getAssigneeId() {
        return assigneeId;
    }

    public Integer getStatus() {
        return status;
    }

    public String getEmpName() {
        return empName;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public Long getChecklistTemplateId() {
        return checklistTemplateId;
    }

    public List<String> getChecklistItems() {
        return checklistItems;
    }

    // ✅ Setters
    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public void setAssigneeId(Integer assigneeId) {
        this.assigneeId = assigneeId;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public void setChecklistTemplateId(Long checklistTemplateId) {
        this.checklistTemplateId = checklistTemplateId;
    }

    public void setChecklistItems(List<String> checklistItems) {
        this.checklistItems = checklistItems;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }
}
