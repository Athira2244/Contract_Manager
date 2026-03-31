package taskmanager.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import taskmanager.taskmanager.model.TaskChecklistItem;
import taskmanager.taskmanager.repository.TaskChecklistItemRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/task_checklists")
@CrossOrigin(origins = "https://spboottestapi.mypayrollmaster.online/")
public class TaskChecklistController {

    private final TaskChecklistItemRepository repo;

    public TaskChecklistController(TaskChecklistItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/task/{taskId}")
    public List<TaskChecklistItem> getItemsByTask(@PathVariable Long taskId) {
        return repo.findByTaskId(taskId);
    }

    @PutMapping("/{id}/toggle")
    public TaskChecklistItem toggleItem(@PathVariable Long id) {
        TaskChecklistItem item = repo.findById(id).orElseThrow();
        item.setIsCompleted(!item.getIsCompleted());
        return repo.save(item);
    }

    @PostMapping
    public TaskChecklistItem addItem(@RequestBody TaskChecklistItem item) {
        return repo.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
