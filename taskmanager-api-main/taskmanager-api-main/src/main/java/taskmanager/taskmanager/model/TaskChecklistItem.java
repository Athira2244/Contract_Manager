package taskmanager.taskmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "task_checklist_items")
public class TaskChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "item_text")
    private String itemText;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getItemText() { return itemText; }
    public void setItemText(String itemText) { this.itemText = itemText; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean completed) { isCompleted = completed; }
}
