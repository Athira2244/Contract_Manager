package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.TaskStatusEntity;

public interface TaskStatusRepository extends JpaRepository<TaskStatusEntity, Integer> {
}
