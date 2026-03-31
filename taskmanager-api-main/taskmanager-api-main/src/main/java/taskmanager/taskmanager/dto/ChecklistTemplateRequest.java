package taskmanager.taskmanager.dto;

import java.util.List;

public class ChecklistTemplateRequest {
    private String name;
    private Integer createdBy;
    private List<String> items;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public List<String> getItems() { return items; }
    public void setItems(List<String> items) { this.items = items; }
}
