package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import com.example.contract.taskmanager.model.TaskChecklistItem;
import com.example.contract.taskmanager.repository.TaskChecklistItemRepository;

import java.util.List;

@RestController
@RequestMapping("/api/task_checklists")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskChecklistController {

    private final TaskChecklistItemRepository repo;

    public TaskChecklistController(TaskChecklistItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/task/{taskId}")
    public List<TaskChecklistItem> getItemsByTask(@PathVariable("taskId") Long taskId) {
        return repo.findByTaskId(taskId);
    }

    @PutMapping("/{id}/toggle")
    public TaskChecklistItem toggleItem(@PathVariable("id") Long id) {
        TaskChecklistItem item = repo.findById(id).orElseThrow();
        item.setIsCompleted(!item.getIsCompleted());
        return repo.save(item);
    }

    @PostMapping
    public TaskChecklistItem addItem(@RequestBody TaskChecklistItem item) {
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable("id") Long id) {
        repo.deleteById(id);
    }
}
