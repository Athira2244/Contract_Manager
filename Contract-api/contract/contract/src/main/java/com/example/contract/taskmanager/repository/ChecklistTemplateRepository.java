package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.ChecklistTemplate;
import java.util.List;

public interface ChecklistTemplateRepository extends JpaRepository<ChecklistTemplate, Long> {
    List<ChecklistTemplate> findByCreatedBy(Integer createdBy);
}
