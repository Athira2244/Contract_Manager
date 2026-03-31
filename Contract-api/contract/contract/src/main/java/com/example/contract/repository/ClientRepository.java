package com.example.contract.repository;

import com.example.contract.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByStatus(String status);
    List<Client> findByCreatedBy(String createdBy);
}
