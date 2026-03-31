package com.example.contract.taskmanager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiConfig {

    @Value("${api.base.url}")
    private String baseUrl;

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getStatusesEndpoint() {
        return baseUrl + "/api/statuses";
    }
}
