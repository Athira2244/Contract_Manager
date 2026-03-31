package com.example.contract.taskmanager.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.contract.taskmanager.dto.TaskResponse;
import com.example.contract.taskmanager.model.Task;
import com.example.contract.taskmanager.model.TaskAssignee;
import com.example.contract.taskmanager.repository.TaskAssigneeRepository;
import com.example.contract.taskmanager.repository.TaskRepository;

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

    public List<TaskResponse> getTasksForAssignee(Integer assigneeId) {
        List<TaskResponse> result = new ArrayList<>();

        List<Task> parentTasks = taskRepository.findByAssigneeIdAndIsAssignee(assigneeId, 1);
        for (Task task : parentTasks) {
            result.add(mapToResponse(task, null, "tasks", 1));
        }

        List<TaskAssignee> assignedTasks = taskAssigneeRepository.findByAssigneeIdAndIsAssignee(assigneeId, 1);
        for (TaskAssignee ta : assignedTasks) {
            Optional<Task> parentTaskOpt = taskRepository.findById(ta.getTaskId());
            if (parentTaskOpt.isPresent()) {
                result.add(mapToResponse(parentTaskOpt.get(), ta, "task_assignees", ta.getIsAssignee()));
            }
        }

        return result;
    }

    public List<TaskResponse> getTasksByUser(Integer userId) {
        java.util.Set<Long> taskIds = new java.util.HashSet<>();
        List<TaskResponse> result = new ArrayList<>();

        List<TaskResponse> assigned = getTasksForAssignee(userId);
        for (TaskResponse r : assigned) {
            result.add(r);
            taskIds.add(r.getTaskId());
        }

        List<Task> createdTasks = taskRepository.findByCreatedBy(userId);
        for (Task task : createdTasks) {
            if (!taskIds.contains(task.getId())) {
                Optional<TaskAssignee> currentAssigneeOpt = taskAssigneeRepository
                        .findByTaskIdAndIsAssignee(task.getId(), 1);

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
        response.setContractId(task.getContractId());

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

    @Transactional
    public TaskAssignee reassignTask(Long taskId, Integer newAssigneeId, String empName) {
        Task parentTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isReassignToOriginal = parentTask.getAssigneeId().equals(newAssigneeId);

        Optional<TaskAssignee> currentAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);

        if (isReassignToOriginal) {
            if (currentAssigneeOpt.isPresent()) {
                taskAssigneeRepository.deactivateCurrentAssignee(taskId);
            }

            parentTask.setIsAssignee(1);
            taskRepository.save(parentTask);

            return null;
        }

        if (currentAssigneeOpt.isPresent()) {
            taskAssigneeRepository.deactivateCurrentAssignee(taskId);
        } else {
            parentTask.setIsAssignee(0);
            taskRepository.save(parentTask);
        }

        TaskAssignee newAssignment = new TaskAssignee();
        newAssignment.setTaskId(taskId);
        newAssignment.setAssigneeId(newAssigneeId);
        newAssignment.setAssigneeName(empName);
        newAssignment.setStatus(0);
        newAssignment.setIsAssignee(1);
        newAssignment.setAssignedAt(LocalDateTime.now());
        newAssignment.setPendingDate(LocalDateTime.now());

        return taskAssigneeRepository.save(newAssignment);
    }

    @Transactional
    public void updateTaskStatus(Long taskId, Integer assigneeId, Integer newStatus) {
        Optional<TaskAssignee> taskAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);

        if (taskAssigneeOpt.isPresent()) {
            TaskAssignee taskAssignee = taskAssigneeOpt.get();
            taskAssignee.setStatus(newStatus);

            if (newStatus == 1) {
                taskAssignee.setInProgressDate(LocalDateTime.now());
            } else if (newStatus == 2) {
                taskAssignee.setCompletedDate(LocalDateTime.now());
            }

            taskAssigneeRepository.save(taskAssignee);
        } else {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            task.setStatus(newStatus);

            if (newStatus == 1) {
                task.setInProgressDate(LocalDateTime.now());
            } else if (newStatus == 2) {
                task.setCompletedDate(LocalDateTime.now());
            }

            taskRepository.save(task);
        }
    }

    public boolean isTaskReassigned(Long taskId) {
        return taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1).isPresent();
    }

    public Integer getCurrentAssigneeId(Long taskId) {
        Optional<TaskAssignee> taskAssigneeOpt = taskAssigneeRepository.findByTaskIdAndIsAssignee(taskId, 1);
        if (taskAssigneeOpt.isPresent()) {
            return taskAssigneeOpt.get().getAssigneeId();
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return task.getAssigneeId();
    }
}
