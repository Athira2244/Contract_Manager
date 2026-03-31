package com.example.contract.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.example.contract.taskmanager.dto.FeedRequest;
import com.example.contract.taskmanager.service.FeedService;
import com.example.contract.taskmanager.model.Feed;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feeds")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @PostMapping
    public ResponseEntity<?> createFeed(
            @RequestBody FeedRequest dto,
            HttpServletRequest request) {
        Integer senderId = (Integer) request.getAttribute("emp_fkey");
        if (senderId == null)
            senderId = 1;

        feedService.createFeed(dto, senderId);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Feed sent successfully"));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<List<Feed>> getFeedsForEmployee(@PathVariable("empId") Integer empId) {
        return ResponseEntity.ok(
                feedService.getFeedsForEmployee(empId));
    }
}
