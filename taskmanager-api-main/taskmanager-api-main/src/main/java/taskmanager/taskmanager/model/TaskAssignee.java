package taskmanager.taskmanager.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignees")
public class TaskAssignee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "assignee_id", nullable = false)
    private Integer assigneeId;

    @Column(name = "assignee_name", length = 255)
    private String assigneeName;

    @Column(name = "status")
    private Integer status = 0; // Default to 0 (PENDING)

    @Column(name = "is_assignee")
    private Integer isAssignee = 1;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    // Transient field for employee name (from join or API)
    @Transient
    private String empName;

    // Transient fields from parent task
    @Transient
    private String taskName;

    @Transient
    private String description;

    @Transient
    private LocalDateTime deadline;

    @Transient
    private String attachment;

    // Constructors
    public TaskAssignee() {
        this.assignedAt = LocalDateTime.now();
    }

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

    public Integer getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Integer assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getIsAssignee() {
        return isAssignee;
    }

    public void setIsAssignee(Integer isAssignee) {
        this.isAssignee = isAssignee;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    @Column(name = "pending_date")
    private LocalDateTime pendingDate;

    @Column(name = "in_progress_date")
    private LocalDateTime inProgressDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public LocalDateTime getPendingDate() { return pendingDate; }
    public void setPendingDate(LocalDateTime pendingDate) { this.pendingDate = pendingDate; }

    public LocalDateTime getInProgressDate() { return inProgressDate; }
    public void setInProgressDate(LocalDateTime inProgressDate) { this.inProgressDate = inProgressDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

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

    public String getAttachment() {
        return attachment;
    }

    public void setAttachment(String attachment) {
        this.attachment = attachment;
    }
}
