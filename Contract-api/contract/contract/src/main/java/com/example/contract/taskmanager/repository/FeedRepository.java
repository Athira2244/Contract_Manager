package com.example.contract.taskmanager.repository;

import com.example.contract.taskmanager.model.Feed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedRepository extends JpaRepository<Feed, Integer> {

    @Query("""
                SELECT f
                FROM Feed f
                WHERE f.isGlobal = true
                   OR f.feedId IN (
                        SELECT fr.feedId
                        FROM FeedRecipient fr
                        WHERE fr.empFkey = :empId
                   )
                ORDER BY f.isAnnouncement DESC, f.createdAt DESC
            """)
    List<Feed> findFeedsForEmployee(@Param("empId") Integer empId);
}
