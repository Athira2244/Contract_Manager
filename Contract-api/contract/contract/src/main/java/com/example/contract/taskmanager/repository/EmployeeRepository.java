package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.Employee;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByEmailAndPassword(String email, String password);
}
