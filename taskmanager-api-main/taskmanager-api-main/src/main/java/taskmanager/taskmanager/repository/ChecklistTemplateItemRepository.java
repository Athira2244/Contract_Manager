package taskmanager.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import taskmanager.taskmanager.model.ChecklistTemplateItem;
import java.util.List;

public interface ChecklistTemplateItemRepository extends JpaRepository<ChecklistTemplateItem, Long> {
    List<ChecklistTemplateItem> findByTemplateId(Long templateId);
    void deleteByTemplateId(Long templateId);
}
