package com.example.contract.repository;

import com.example.contract.entity.Deliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, Long> {
    List<Deliverable> findByContractId(Long contractId);

    List<Deliverable> findByMonthAndYear(Integer month, Integer year);
}
