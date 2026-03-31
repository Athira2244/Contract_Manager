package com.example.contract.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.contract.taskmanager.model.FeedRecipient;

public interface FeedRecipientRepository extends JpaRepository<FeedRecipient, Integer> {
}
