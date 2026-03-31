package taskmanager.taskmanager.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import taskmanager.taskmanager.dto.TaskResponse;
import taskmanager.taskmanager.model.Task;
import taskmanager.taskmanager.model.TaskAssignee;
import taskmanager.taskmanager.repository.TaskAssigneeRepository;
import taskmanager.taskmanager.repository.TaskRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskAssigneeService {

    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;

    public TaskAssigneeService(TaskRepository taskRepository, TaskAssigneeRepository taskAssigneeRepository) {
        this.taskRepository = taskRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
    }

    /**
     * Get all tasks for a specific assignee (from both tasks and task_assignees tables)
     */
    public List<TaskResponse> getTasksForAssignee(Integer assigneeId) {
        List<TaskResponse> result = new ArrayList<>();

        // 1. Get tasks from tasks table where is_assignee = 1 (never reassigned)
        List<Task> parentTasks = taskRepository.findByAssigneeIdAndIsAssignee(assigneeId, 1);
        for (Task task : parentTasks) {
            result.add(mapToResponse(task, null, "tasks", 1));
        }

        // 2. Get tasks from task_assignees table where is_assignee = 1
        List<TaskAssignee> assignedTasks = taskAssigneeRepository.findByAssigneeIdAndIsAssignee(assigneeId, 1);
        for (TaskAssignee ta : assignedTasks) {
            Optional<Task> parentTaskOpt = taskRepository.findById(ta.getTaskId());
            if (parentTaskOpt.isPresent()) {
                result.add(mapToResponse(parentTaskOpt.get(), ta, "task_assignees", ta.getIsAssignee()));
            }
        }

        return result;
    }

    /**
     * Get all tasks related to a user (Assigned or Created)
     */
    public List<TaskResponse> getTasksByUser(Integer userId) {
        java.util.Set<Long> taskIds = new java.util.HashSet<>();
        List<TaskResponse> result = new ArrayList<>();

        // 1. Get Assigned Tasks (using existing logic)
        List<TaskResponse> assigned = getTasksForAssignee(userId);
        for (TaskResponse r : assigned) {
            result.add(r);
            taskIds.add(r.getTaskId());
        }

        // 2. Get Created Tasks
        List<Task> createdTasks = taskRepository.findByCreatedBy(userId);
        for (Task task : createdTasks) {
            if (!taskIds.contains(task.getId())) {
                // Determine if there's a current assignment for this task
                Optional<TaskAssignee> currentAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(task.getId(), 1);
                
                if (currentAssigneeOpt.isPresent()) {
                    result.add(mapToResponse(task, currentAssigneeOpt.get(), "task_assignees", 1));
                } else {
                    result.add(mapToResponse(task, null, "tasks", task.getIsAssignee()));
                }
                taskIds.add(task.getId());
            }
        }

        return result;
    }

    private TaskResponse mapToResponse(Task task, TaskAssignee ta, String source, Integer isAssignee) {
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getId());
        response.setTaskName(task.getTaskName());
        response.setDescription(task.getDescription());
        response.setDeadline(task.getDeadline());
        response.setCreatedBy(task.getCreatedBy());
        response.setCreatedByName(task.getCreatedByName());
        response.setAttachment(task.getAttachment());
        
        if (ta != null) {
            response.setId(ta.getId());
            response.setAssigneeId(ta.getAssigneeId());
            response.setEmpName(ta.getAssigneeName());
            response.setStatus(ta.getStatus());
            response.setPendingDate(ta.getPendingDate());
            response.setInProgressDate(ta.getInProgressDate());
            response.setCompletedDate(ta.getCompletedDate());
            response.setSource("task_assignees");
            response.setIsAssignee(ta.getIsAssignee());
        } else {
            response.setId(task.getId());
            response.setAssigneeId(task.getAssigneeId());
            response.setEmpName(task.getEmpName());
            response.setStatus(task.getStatus());
            response.setPendingDate(task.getPendingDate());
            response.setInProgressDate(task.getInProgressDate());
            response.setCompletedDate(task.getCompletedDate());
            response.setSource("tasks");
            response.setIsAssignee(isAssignee);
        }
        return response;
    }

    /**
     * Handle task reassignment
     */
    @Transactional
    public TaskAssignee reassignTask(Long taskId, Integer newAssigneeId, String empName) {
        // Check if task exists in tasks table
        Task parentTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if reassigning back to the original assignee (in tasks table)
        boolean isReassignToOriginal = parentTask.getAssigneeId().equals(newAssigneeId);

        // Check if this is the first assignment or reassignment
        Optional<TaskAssignee> currentAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);

        if (isReassignToOriginal) {
            // Reassigning back to original assignee in tasks table
            if (currentAssigneeOpt.isPresent()) {
                // Deactivate current assignee in task_assignees
                taskAssigneeRepository.deactivateCurrentAssignee(taskId);
            }
            
            // Reactivate the original assignee in tasks table
            parentTask.setIsAssignee(1);
            taskRepository.save(parentTask);
            
            // Return null to indicate no new task_assignee record created
            return null;
        }

        // Normal reassignment flow (not back to original)
        if (currentAssigneeOpt.isPresent()) {
            // This is a reassignment - deactivate current assignee in task_assignees
            taskAssigneeRepository.deactivateCurrentAssignee(taskId);
        } else {
            // This is the first assignment - deactivate in tasks table
            parentTask.setIsAssignee(0);
            taskRepository.save(parentTask);
        }

        // Create new assignment in task_assignees
        TaskAssignee newAssignment = new TaskAssignee();
        newAssignment.setTaskId(taskId);
        newAssignment.setAssigneeId(newAssigneeId);
        newAssignment.setAssigneeName(empName); // Store the assignee name
        newAssignment.setStatus(0); // 0 = PENDING
        newAssignment.setIsAssignee(1);
        newAssignment.setAssignedAt(LocalDateTime.now());
        newAssignment.setPendingDate(LocalDateTime.now()); // Set pending date for new assignment

        return taskAssigneeRepository.save(newAssignment);
    }

    /**
     * Update task status - handles both scenarios
     */
    @Transactional
    public void updateTaskStatus(Long taskId, Integer assigneeId, Integer newStatus) {
        // Check if task is in task_assignees (has been reassigned)
        Optional<TaskAssignee> taskAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);

        if (taskAssigneeOpt.isPresent()) {
            // Update status in task_assignees
            TaskAssignee taskAssignee = taskAssigneeOpt.get();
            taskAssignee.setStatus(newStatus);
            
            if (newStatus == 1) { // IN_PROGRESS
                taskAssignee.setInProgressDate(LocalDateTime.now());
            } else if (newStatus == 2) { // COMPLETED
                taskAssignee.setCompletedDate(LocalDateTime.now());
            }

            taskAssigneeRepository.save(taskAssignee);
        } else {
            // Update status in tasks table (never reassigned)
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            task.setStatus(newStatus);

            if (newStatus == 1) { // IN_PROGRESS
                task.setInProgressDate(LocalDateTime.now());
            } else if (newStatus == 2) { // COMPLETED
                task.setCompletedDate(LocalDateTime.now());
            }

            taskRepository.save(task);
        }
    }

    /**
     * Check if a task has been reassigned
     */
    public boolean isTaskReassigned(Long taskId) {
        return taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1).isPresent();
    }

    /**
     * Get current assignee ID for a task
     */
    public Integer getCurrentAssigneeId(Long taskId) {
        Optional<TaskAssignee> taskAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);
        if (taskAssigneeOpt.isPresent()) {
            return taskAssigneeOpt.get().getAssigneeId();
        }
        
        // Fallback to tasks table
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return task.getAssigneeId();
    }
}
