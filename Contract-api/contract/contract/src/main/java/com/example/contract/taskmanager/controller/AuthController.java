package com.example.contract.taskmanager.controller;

import com.example.contract.taskmanager.model.Employee;
import com.example.contract.taskmanager.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final EmployeeRepository employeeRepository;

    public AuthController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String userId = credentials.get("user_id");
        String password = credentials.get("password");

        Optional<Employee> employee = employeeRepository.findByEmailAndPassword(userId, password);

        if (employee.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "success", 1,
                    "data", employee.get()));
        } else {
            return ResponseEntity.ok(Map.of(
                    "success", 0,
                    "message", "Invalid login credentials"));
        }
    }
}
