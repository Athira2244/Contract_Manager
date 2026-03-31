package taskmanager.taskmanager.dto;

import java.time.LocalDateTime;

public class TaskReportDTO {
    private Long taskId;
    private String taskName;
    private String description;
    private String empName;
    private String totalTimeTaken; // Formatted string HH:mm:ss
    private LocalDateTime createdDate; // Pending Date (Creation)
    private LocalDateTime inProgressDate;
    private LocalDateTime completedDate;
    private Integer status;

    // Constructors
    public TaskReportDTO() {}

    // Getters and Setters
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getTotalTimeTaken() { return totalTimeTaken; }
    public void setTotalTimeTaken(String totalTimeTaken) { this.totalTimeTaken = totalTimeTaken; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getInProgressDate() { return inProgressDate; }
    public void setInProgressDate(LocalDateTime inProgressDate) { this.inProgressDate = inProgressDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
