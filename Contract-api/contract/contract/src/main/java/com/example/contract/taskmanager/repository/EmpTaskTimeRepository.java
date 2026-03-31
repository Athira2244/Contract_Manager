package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.EmpTaskTime;

import java.util.List;

public interface EmpTaskTimeRepository
        extends JpaRepository<EmpTaskTime, Integer> {

    List<EmpTaskTime> findByTaskFkey(Integer taskFkey);
}
