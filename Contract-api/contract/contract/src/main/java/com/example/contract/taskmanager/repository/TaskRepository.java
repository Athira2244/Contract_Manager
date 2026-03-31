package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Find tasks by assignee and is_assignee flag
    List<Task> findByAssigneeIdAndIsAssignee(Integer assigneeId, Integer isAssignee);

    // Find tasks by creator
    List<Task> findByCreatedBy(Integer createdBy);
}
