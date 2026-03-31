package taskmanager.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import taskmanager.taskmanager.model.TaskStatusEntity;
import taskmanager.taskmanager.repository.TaskStatusRepository;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
@CrossOrigin(origins = "https://spboottestapi.mypayrollmaster.online/")
public class TaskStatusController {

    private final TaskStatusRepository taskStatusRepository;

    public TaskStatusController(TaskStatusRepository taskStatusRepository) {
        this.taskStatusRepository = taskStatusRepository;
    }

    @GetMapping
    public List<TaskStatusEntity> getAllStatuses() {
        return taskStatusRepository.findAll();
    }
    
    // Optional: Add status if needed (though usually done via DB admin)
    @PostMapping
    public TaskStatusEntity addStatus(@RequestBody TaskStatusEntity status) {
        return taskStatusRepository.save(status);
    }
}
