package com.example.contract.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.contract.taskmanager.config.ApiConfig;

@Service
public class ExternalApiService {

    @Autowired
    private ApiConfig apiConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getStatusesFromExternalApi() {
        String url = apiConfig.getStatusesEndpoint();
        return restTemplate.getForObject(url, String.class);
    }
}
