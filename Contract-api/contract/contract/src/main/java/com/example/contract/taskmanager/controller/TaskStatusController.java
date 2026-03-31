package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import com.example.contract.taskmanager.model.TaskStatusEntity;
import com.example.contract.taskmanager.repository.TaskStatusRepository;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskStatusController {

    private final TaskStatusRepository taskStatusRepository;

    public TaskStatusController(TaskStatusRepository taskStatusRepository) {
        this.taskStatusRepository = taskStatusRepository;
    }

    @GetMapping
    public List<TaskStatusEntity> getAllStatuses() {
        return taskStatusRepository.findAll();
    }

    @PostMapping
    public TaskStatusEntity addStatus(@RequestBody TaskStatusEntity status) {
        return taskStatusRepository.save(status);
    }
}
