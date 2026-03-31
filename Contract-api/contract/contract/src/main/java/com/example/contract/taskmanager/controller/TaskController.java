package com.example.contract.taskmanager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.example.contract.taskmanager.dto.TaskRequest;
import com.example.contract.taskmanager.dto.TaskResponse;
import com.example.contract.taskmanager.dto.TaskReportDTO;
import com.example.contract.taskmanager.model.Task;
import com.example.contract.taskmanager.model.EmpTaskTime;
import com.example.contract.taskmanager.model.TaskChecklistItem;
import com.example.contract.taskmanager.model.ChecklistTemplateItem;
import com.example.contract.taskmanager.repository.TaskRepository;
import com.example.contract.taskmanager.repository.EmpTaskTimeRepository;
import com.example.contract.taskmanager.repository.ChecklistTemplateItemRepository;
import com.example.contract.taskmanager.repository.TaskChecklistItemRepository;
import com.example.contract.taskmanager.service.TaskAssigneeService;
import com.example.contract.taskmanager.service.TaskGenerationService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskAssigneeService taskAssigneeService;
    private final EmpTaskTimeRepository empTaskTimeRepository;
    private final ChecklistTemplateItemRepository checklistTemplateItemRepo;
    private final TaskChecklistItemRepository taskChecklistItemRepo;
    private final TaskGenerationService taskGenerationService;

    public TaskController(TaskRepository taskRepository,
            TaskAssigneeService taskAssigneeService,
            EmpTaskTimeRepository empTaskTimeRepository,
            ChecklistTemplateItemRepository checklistTemplateItemRepo,
            TaskChecklistItemRepository taskChecklistItemRepo,
            TaskGenerationService taskGenerationService) {
        this.taskRepository = taskRepository;
        this.taskAssigneeService = taskAssigneeService;
        this.empTaskTimeRepository = empTaskTimeRepository;
        this.checklistTemplateItemRepo = checklistTemplateItemRepo;
        this.taskChecklistItemRepo = taskChecklistItemRepo;
        this.taskGenerationService = taskGenerationService;
    }

    @Transactional
    @PostMapping
    public Task createTask(@RequestBody TaskRequest request) {
        Task task = new Task();
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(0); // Default 0 = PENDING
        task.setAssigneeId(request.getAssigneeId());
        task.setEmpName(request.getEmpName());
        task.setCreatedBy(request.getCreatedBy());
        task.setCreatedByName(request.getCreatedByName());
        task.setPendingDate(LocalDateTime.now());
        task.setContractId(request.getContractId());

        Task savedTask = taskRepository.save(task);

        if (request.getChecklistTemplateId() != null) {
            List<ChecklistTemplateItem> items = checklistTemplateItemRepo
                    .findByTemplateId(request.getChecklistTemplateId());
            for (ChecklistTemplateItem item : items) {
                TaskChecklistItem checklistItem = new TaskChecklistItem();
                checklistItem.setTaskId(savedTask.getId());
                checklistItem.setItemText(item.getItemText());
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }

        if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
            for (String itemText : request.getChecklistItems()) {
                TaskChecklistItem checklistItem = new TaskChecklistItem();
                checklistItem.setTaskId(savedTask.getId());
                checklistItem.setItemText(itemText);
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }

        return savedTask;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<TaskResponse> getTasksForUser(@PathVariable("userId") Integer userId) {
        return taskAssigneeService.getTasksByUser(userId);
    }

    @GetMapping("/assignee/{assigneeId}")
    public List<TaskResponse> getTasksForAssignee(@PathVariable("assigneeId") Integer assigneeId) {
        return taskAssigneeService.getTasksForAssignee(assigneeId);
    }

    @GetMapping("/report/{empId}")
    public List<TaskReportDTO> getTaskReport(@PathVariable("empId") Integer empId) {
        List<TaskResponse> tasks = taskAssigneeService.getTasksForAssignee(empId);
        List<TaskReportDTO> reportList = new ArrayList<>();

        for (TaskResponse task : tasks) {
            TaskReportDTO report = new TaskReportDTO();
            report.setTaskId(task.getTaskId());
            report.setTaskName(task.getTaskName());
            report.setDescription(task.getDescription());
            report.setEmpName(task.getEmpName());
            report.setCreatedDate(task.getPendingDate());
            report.setInProgressDate(task.getInProgressDate());
            report.setCompletedDate(task.getCompletedDate());
            report.setStatus(task.getStatus());
            report.setContractId(task.getContractId());

            List<EmpTaskTime> timeLogs = empTaskTimeRepository.findByTaskFkey(task.getTaskId().intValue());
            int totalMinutes = timeLogs.stream().mapToInt(EmpTaskTime::getDurationMinutes).sum();

            int hours = totalMinutes / 60;
            int minutes = totalMinutes % 60;
            String timeString = String.format("%02d:%02d", hours, minutes);
            report.setTotalTimeTaken(timeString);

            reportList.add(report);
        }
        return reportList;
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateTaskStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {

        Integer newStatus = body.get("status") instanceof Integer
                ? (Integer) body.get("status")
                : Integer.parseInt(body.get("status").toString());

        Integer assigneeId = body.get("assigneeId") != null ? Integer.parseInt(body.get("assigneeId").toString())
                : null;

        taskAssigneeService.updateTaskStatus(id, assigneeId, newStatus);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Status updated successfully");
        response.put("status", newStatus);
        return response;
    }

    @Transactional
    @PutMapping("/{id}")
    public Map<String, String> updateTask(
            @PathVariable("id") Long id,
            @RequestBody TaskRequest request) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Integer currentAssigneeId;
        boolean taskHasBeenReassigned = taskAssigneeService.isTaskReassigned(id);

        if (taskHasBeenReassigned) {
            currentAssigneeId = taskAssigneeService.getCurrentAssigneeId(id);
        } else {
            currentAssigneeId = task.getAssigneeId();
        }

        boolean assigneeChanged = request.getAssigneeId() != null &&
                !request.getAssigneeId().equals(currentAssigneeId);

        if (assigneeChanged) {
            taskAssigneeService.reassignTask(id, request.getAssigneeId(), request.getEmpName());
        }

        if (request.getTaskName() != null)
            task.setTaskName(request.getTaskName());

        if (request.getDescription() != null)
            task.setDescription(request.getDescription());

        if (request.getDeadline() != null)
            task.setDeadline(request.getDeadline());

        if (request.getAssigneeId() != null)
            task.setAssigneeId(request.getAssigneeId());

        if (request.getEmpName() != null)
            task.setEmpName(request.getEmpName());

        if (request.getStatus() != null)
            task.setStatus(request.getStatus());

        if (request.getContractId() != null)
            task.setContractId(request.getContractId());

        taskRepository.save(task);

        if (request.getChecklistTemplateId() != null) {
            List<TaskChecklistItem> existing = taskChecklistItemRepo.findByTaskId(id);
            if (existing.isEmpty()) {
                List<ChecklistTemplateItem> items = checklistTemplateItemRepo
                        .findByTemplateId(request.getChecklistTemplateId());
                for (ChecklistTemplateItem item : items) {
                    TaskChecklistItem checklistItem = new TaskChecklistItem();
                    checklistItem.setTaskId(id);
                    checklistItem.setItemText(item.getItemText());
                    checklistItem.setIsCompleted(false);
                    taskChecklistItemRepo.save(checklistItem);
                }
            }
        }

        if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
            for (String itemText : request.getChecklistItems()) {
                TaskChecklistItem checklistItem = new TaskChecklistItem();
                checklistItem.setTaskId(id);
                checklistItem.setItemText(itemText);
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", assigneeChanged ? "Task reassigned successfully" : "Task updated successfully");
        return response;
    }

    @PostMapping("/generate-from-contract/{contractId}")
    public ResponseEntity<List<Task>> generateFromContract(@PathVariable("contractId") Long contractId) {
        return ResponseEntity.ok(taskGenerationService.generateTasksFromContract(contractId));
    }
}
