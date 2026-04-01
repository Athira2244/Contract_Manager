package com.example.contract.repository;

import com.example.contract.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    java.util.List<Service> findByCreatedBy(String createdBy);
}
