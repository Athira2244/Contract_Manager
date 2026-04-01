package com.example.contract.repository;

import com.example.contract.entity.ContractService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractServiceRepository extends JpaRepository<ContractService, Long> {
}
