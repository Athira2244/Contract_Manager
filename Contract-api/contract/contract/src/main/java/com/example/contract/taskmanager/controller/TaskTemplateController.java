package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import com.example.contract.taskmanager.model.TaskTemplate;
import com.example.contract.taskmanager.repository.TaskTemplateRepository;
import java.util.List;

@RestController
@RequestMapping("/api/task-templates")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskTemplateController {

    private final TaskTemplateRepository repository;

    public TaskTemplateController(TaskTemplateRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TaskTemplate> getAllTemplates() {
        return repository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<TaskTemplate> getByUser(@PathVariable("userId") Integer userId) {
        return repository.findByCreatedBy(userId);
    }

    @PostMapping
    public TaskTemplate createTemplate(@RequestBody TaskTemplate template) {
        return repository.save(template);
    }

    @PutMapping("/{id}")
    public TaskTemplate updateTemplate(@PathVariable("id") Long id, @RequestBody TaskTemplate updated) {
        TaskTemplate existing = repository.findById(id).orElseThrow();
        existing.setTemplateName(updated.getTemplateName());
        existing.setDefaultDescription(updated.getDefaultDescription());
        existing.setDefaultPriority(updated.getDefaultPriority());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable("id") Long id) {
        repository.deleteById(id);
    }
}
