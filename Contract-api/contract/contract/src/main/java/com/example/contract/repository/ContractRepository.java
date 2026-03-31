package com.example.contract.repository;

import com.example.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByClientId(Long clientId);

    List<Contract> findByCreatedBy(String createdBy);

    List<Contract> findByStatus(String status);

    List<Contract> findTop5ByOrderByIdDesc();

    List<Contract> findByEndDateBetween(LocalDate startDate, LocalDate endDate);
}
