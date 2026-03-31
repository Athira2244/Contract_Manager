package taskmanager.taskmanager.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_status_master")
public class TaskStatusEntity {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "status_name", nullable = false)
    private String statusName;

    public TaskStatusEntity() {
    }

    public TaskStatusEntity(Integer id, String statusName) {
        this.id = id;
        this.statusName = statusName;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }
}
