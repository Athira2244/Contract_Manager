package taskmanager.taskmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "checklist_template_items")
public class ChecklistTemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "item_text")
    private String itemText;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }

    public String getItemText() { return itemText; }
    public void setItemText(String itemText) { this.itemText = itemText; }
}
