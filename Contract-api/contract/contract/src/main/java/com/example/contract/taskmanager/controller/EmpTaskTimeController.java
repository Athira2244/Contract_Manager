package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.example.contract.taskmanager.dto.EmpTaskTimeRequest;
import com.example.contract.taskmanager.model.EmpTaskTime;
import com.example.contract.taskmanager.repository.EmpTaskTimeRepository;

import java.util.List;

@RestController
@RequestMapping("/api/emp_task_time")
@CrossOrigin(origins = "http://localhost:3000")
public class EmpTaskTimeController {

    private final EmpTaskTimeRepository repo;

    public EmpTaskTimeController(EmpTaskTimeRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<?> save(
            @RequestBody EmpTaskTimeRequest request) {
        EmpTaskTime time = new EmpTaskTime();
        time.setEmpFkey(request.getEmpFkey());
        time.setTaskFkey(request.getTaskFkey());
        time.setStartTime(request.getStartTime());
        time.setEndTime(request.getEndTime());
        time.setDurationMinutes(request.getDurationMinutes());
        time.setComment(request.getComment());
        time.setEmpName(request.getEmpName());

        return ResponseEntity.ok(repo.save(time));
    }

    @GetMapping("/task/{id}")
    public List<EmpTaskTime> getByTask(@PathVariable("id") Integer id) {
        return repo.findByTaskFkey(id);
    }
}
