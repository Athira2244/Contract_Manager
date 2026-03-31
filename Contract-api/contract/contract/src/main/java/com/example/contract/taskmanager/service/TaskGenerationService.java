package com.example.contract.taskmanager.service;

import com.example.contract.entity.Contract;
import com.example.contract.entity.ContractService;
import com.example.contract.entity.SubService;
import com.example.contract.repository.ContractRepository;
import com.example.contract.taskmanager.model.Task;
import com.example.contract.taskmanager.model.TaskTemplate;
import com.example.contract.taskmanager.repository.TaskRepository;
import com.example.contract.taskmanager.repository.TaskTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TaskGenerationService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskTemplateRepository templateRepository;

    @Transactional
    public List<Task> generateTasksFromContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        List<Task> createdTasks = new ArrayList<>();

        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                if (cs.getOptedSubServices() != null) {
                    for (SubService subService : cs.getOptedSubServices()) {
                        if (subService.getTaskTemplateId() != null) {
                            createdTasks.add(createTaskFromTemplate(contract, subService));
                        }
                    }
                }
            }
        }
        return createdTasks;
    }

    private Task createTaskFromTemplate(Contract contract, SubService subService) {
        TaskTemplate template = templateRepository.findById(subService.getTaskTemplateId())
                .orElseThrow(
                        () -> new RuntimeException("Template not found for id: " + subService.getTaskTemplateId()));

        Task task = new Task();
        task.setContractId(contract.getId());
        task.setTaskName(template.getTemplateName());
        task.setDescription(template.getDefaultDescription());
        task.setStatus(0); // Pending
        task.setPriority(template.getDefaultPriority());
        task.setCreatedBy(1); // System
        task.setCreatedByName("System");
        task.setIsAssignee(1);

        return taskRepository.save(task);
    }
}
