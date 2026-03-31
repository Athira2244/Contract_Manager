package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import com.example.contract.taskmanager.model.Employee;
import com.example.contract.taskmanager.repository.EmployeeRepository;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }
}
