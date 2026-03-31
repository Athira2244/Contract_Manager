package taskmanager.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class TaskResponse {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("taskId")
    private Long taskId;  // For task_assignees, this is the parent task_id
    
    @JsonProperty("taskName")
    private String taskName;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("assigneeId")
    private Integer assigneeId;
    
    @JsonProperty("empName")
    private String empName;
    
    @JsonProperty("deadline")
    private LocalDateTime deadline;
    
    @JsonProperty("status")
    private Integer status;
    
    @JsonProperty("attachment")
    private String attachment;
    
    @JsonProperty("source")
    private String source; // "tasks" or "task_assignees"
    
    @JsonProperty("isAssignee")
    private Integer isAssignee;

    @JsonProperty("createdBy")
    private Integer createdBy;

    @JsonProperty("createdByName")
    private String createdByName;

    @JsonProperty("pendingDate")
    private LocalDateTime pendingDate;

    @JsonProperty("inProgressDate")
    private LocalDateTime inProgressDate;

    @JsonProperty("completedDate")
    private LocalDateTime completedDate;

    // Constructors
    public TaskResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
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

    public Integer getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Integer assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getAttachment() {
        return attachment;
    }

    public void setAttachment(String attachment) {
        this.attachment = attachment;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Integer getIsAssignee() {
        return isAssignee;
    }

    public void setIsAssignee(Integer isAssignee) {
        this.isAssignee = isAssignee;
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

    public LocalDateTime getPendingDate() { return pendingDate; }
    public void setPendingDate(LocalDateTime pendingDate) { this.pendingDate = pendingDate; }

    public LocalDateTime getInProgressDate() { return inProgressDate; }
    public void setInProgressDate(LocalDateTime inProgressDate) { this.inProgressDate = inProgressDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }
}
