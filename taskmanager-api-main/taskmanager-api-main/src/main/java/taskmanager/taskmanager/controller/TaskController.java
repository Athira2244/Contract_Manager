package taskmanager.taskmanager.controller;

import org.springframework.web.bind.annotation.*;

import taskmanager.taskmanager.dto.TaskRequest;
import taskmanager.taskmanager.dto.TaskResponse;
import taskmanager.taskmanager.model.Employee;
import taskmanager.taskmanager.model.Task;
import taskmanager.taskmanager.repository.TaskRepository;
import taskmanager.taskmanager.service.TaskAssigneeService;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "https://spboottestapi.mypayrollmaster.online/")
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskAssigneeService taskAssigneeService;
    private final taskmanager.taskmanager.repository.EmpTaskTimeRepository empTaskTimeRepository;
    private final taskmanager.taskmanager.repository.ChecklistTemplateItemRepository checklistTemplateItemRepo;
    private final taskmanager.taskmanager.repository.TaskChecklistItemRepository taskChecklistItemRepo;

    public TaskController(TaskRepository taskRepository, 
                          TaskAssigneeService taskAssigneeService, 
                          taskmanager.taskmanager.repository.EmpTaskTimeRepository empTaskTimeRepository,
                          taskmanager.taskmanager.repository.ChecklistTemplateItemRepository checklistTemplateItemRepo,
                          taskmanager.taskmanager.repository.TaskChecklistItemRepository taskChecklistItemRepo) {
        this.taskRepository = taskRepository;
        this.taskAssigneeService = taskAssigneeService;
        this.empTaskTimeRepository = empTaskTimeRepository;
        this.checklistTemplateItemRepo = checklistTemplateItemRepo;
        this.taskChecklistItemRepo = taskChecklistItemRepo;
    }

    // CREATE TASK
    @PostMapping
    public Task createTask(@RequestBody TaskRequest request) {

        Task task = new Task();
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setStatus(0); // Default 0 = PENDING
        task.setAssigneeId(request.getAssigneeId());
        task.setEmpName(request.getEmpName());       // EmpName
        task.setCreatedBy(request.getCreatedBy());
        task.setCreatedByName(request.getCreatedByName());
        task.setPendingDate(java.time.LocalDateTime.now()); // Set pending date on creation

        // Employee employee = new Employee();
        // employee.setEmployeeId(request.getAssigneeId());
        // task.setAssignee(employee);

// System.out.println("DEBUG EmpName = [" + request.getEmpName() + "]");
// System.out.println("DEBUG AssigneeId = [" + request.getAssigneeId() + "]");
        System.out.println("DEBUG CreatedBy received: " + request.getCreatedBy());

        Task savedTask = taskRepository.save(task);

        // Handle Checklist Template
        // Handle Checklist Template
        if (request.getChecklistTemplateId() != null) {
            List<taskmanager.taskmanager.model.ChecklistTemplateItem> items = checklistTemplateItemRepo.findByTemplateId(request.getChecklistTemplateId());
            for (taskmanager.taskmanager.model.ChecklistTemplateItem item : items) {
                taskmanager.taskmanager.model.TaskChecklistItem checklistItem = new taskmanager.taskmanager.model.TaskChecklistItem();
                checklistItem.setTaskId(savedTask.getId());
                checklistItem.setItemText(item.getItemText());
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }
        
        // Handle Ad-hoc Checklist Items
        if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
            for (String itemText : request.getChecklistItems()) {
                taskmanager.taskmanager.model.TaskChecklistItem checklistItem = new taskmanager.taskmanager.model.TaskChecklistItem();
                checklistItem.setTaskId(savedTask.getId());
                checklistItem.setItemText(itemText);
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }

        return savedTask;
    }

    // GET ALL TASKS (old endpoint - kept for compatibility)
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // GET TASKS FOR USER (both created and assigned)
    @GetMapping("/user/{userId}")
    public List<TaskResponse> getTasksForUser(@PathVariable Integer userId) {
        return taskAssigneeService.getTasksByUser(userId);
    }

    // GET TASKS FOR ASSIGNEE - combines tasks and task_assignees
    @GetMapping("/assignee/{assigneeId}")
    public List<TaskResponse> getTasksForAssignee(@PathVariable Integer assigneeId) {
        return taskAssigneeService.getTasksForAssignee(assigneeId);
    }

    // GET TASK REPORT FOR EMPLOYEE
    @GetMapping("/report/{empId}")
    public List<taskmanager.taskmanager.dto.TaskReportDTO> getTaskReport(@PathVariable Integer empId) {
        List<TaskResponse> tasks = taskAssigneeService.getTasksForAssignee(empId);
        List<taskmanager.taskmanager.dto.TaskReportDTO> reportList = new java.util.ArrayList<>();

        for (TaskResponse task : tasks) {
            taskmanager.taskmanager.dto.TaskReportDTO report = new taskmanager.taskmanager.dto.TaskReportDTO();
            report.setTaskId(task.getTaskId());
            report.setTaskName(task.getTaskName());
            report.setDescription(task.getDescription());
            report.setEmpName(task.getEmpName());
            report.setCreatedDate(task.getPendingDate()); // Mapping pendingDate to createdDate for report
            report.setInProgressDate(task.getInProgressDate());
            report.setCompletedDate(task.getCompletedDate());
            report.setStatus(task.getStatus());

            // Calculate Total Time
            List<taskmanager.taskmanager.model.EmpTaskTime> timeLogs = empTaskTimeRepository.findByTaskFkey(task.getTaskId().intValue());
            int totalMinutes = timeLogs.stream().mapToInt(taskmanager.taskmanager.model.EmpTaskTime::getDurationMinutes).sum();
            
            // Format to HH:mm
            int hours = totalMinutes / 60;
            int minutes = totalMinutes % 60;
            String timeString = String.format("%02d:%02d", hours, minutes);
            report.setTotalTimeTaken(timeString);

            reportList.add(report);
        }
        return reportList;
    }

    // UPDATE TASK STATUS - handles both scenarios (parent task or reassigned)
    @PutMapping("/{id}/status")
    public Map<String, Object> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Integer newStatus = body.get("status") instanceof Integer 
            ? (Integer) body.get("status") 
            : Integer.parseInt(body.get("status").toString());

        Integer assigneeId = body.get("assigneeId") != null ? 
            Integer.parseInt(body.get("assigneeId").toString()) : null;

        // Use service to handle status update logic
        taskAssigneeService.updateTaskStatus(id, assigneeId, newStatus);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Status updated successfully");
        response.put("status", newStatus);
        return response;
    }

 @Transactional
@PutMapping("/{id}")
public Map<String, String> updateTask(
        @PathVariable Long id,
        @RequestBody TaskRequest request) {

    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));

    // Get the CURRENT assignee (could be in tasks or task_assignees)
    Integer currentAssigneeId;
    boolean taskHasBeenReassigned = taskAssigneeService.isTaskReassigned(id);
    
    if (taskHasBeenReassigned) {
        // Get current assignee from task_assignees table
        currentAssigneeId = taskAssigneeService.getCurrentAssigneeId(id);
    } else {
        // Get current assignee from tasks table
        currentAssigneeId = task.getAssigneeId();
    }

    // Check if assignee is being changed
    boolean assigneeChanged = request.getAssigneeId() != null && 
                              !request.getAssigneeId().equals(currentAssigneeId);

    if (assigneeChanged) {
        // Handle reassignment through service - always pass the name
        taskAssigneeService.reassignTask(id, request.getAssigneeId(), request.getEmpName());
    }

    // Update other fields in parent task
    if (request.getTaskName() != null)
        task.setTaskName(request.getTaskName());

    if (request.getDescription() != null)
        task.setDescription(request.getDescription());

    if (request.getDeadline() != null)
        task.setDeadline(request.getDeadline());

    // If assignee ID is provided but not changed (or if it's the first assignment)
    if (request.getAssigneeId() != null)
        task.setAssigneeId(request.getAssigneeId());

    // Update empName in tasks table if it's a parent task assignment
    if (request.getEmpName() != null)
        task.setEmpName(request.getEmpName());

    if (request.getStatus() != null)
        task.setStatus(request.getStatus());

    taskRepository.save(task);

    // Handle Checklist Template Update (Add items if template selected and no items exist)
    // Handle Checklist Template Update (Add items if template selected and no items exist)
    if (request.getChecklistTemplateId() != null) {
        // Simple logic: if a template is selected during update, we add its items. 
        // You might want to delete existing items first if you're replacing the checklist.
        // For now, let's just add them if it's a "new" assignment of a checklist.
        List<taskmanager.taskmanager.model.TaskChecklistItem> existing = taskChecklistItemRepo.findByTaskId(id);
        if (existing.isEmpty()) {
            List<taskmanager.taskmanager.model.ChecklistTemplateItem> items = checklistTemplateItemRepo.findByTemplateId(request.getChecklistTemplateId());
            for (taskmanager.taskmanager.model.ChecklistTemplateItem item : items) {
                taskmanager.taskmanager.model.TaskChecklistItem checklistItem = new taskmanager.taskmanager.model.TaskChecklistItem();
                checklistItem.setTaskId(id);
                checklistItem.setItemText(item.getItemText());
                checklistItem.setIsCompleted(false);
                taskChecklistItemRepo.save(checklistItem);
            }
        }
    }

    // Handle Ad-hoc Checklist Items (Add new items)
    if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
       for (String itemText : request.getChecklistItems()) {
           taskmanager.taskmanager.model.TaskChecklistItem checklistItem = new taskmanager.taskmanager.model.TaskChecklistItem();
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

}
