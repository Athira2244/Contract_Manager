package com.example.contract.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    @JsonProperty("employeeId")
    private Integer employeeId;

    @Column(name = "full_name")
    @JsonProperty("fullName")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    // Aliases for Frontend Compatibility
    @JsonProperty("emp_pkey")
    public Integer getEmpPkey() {
        return employeeId;
    }

    @JsonProperty("employee_name")
    public String getEmployeeName() {
        return fullName;
    }

    @JsonProperty("EmpName")
    public String getEmpName() {
        return fullName;
    }

    @JsonProperty("user_id")
    public String getUserId() {
        return email;
    }

    // getters & setters
    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
