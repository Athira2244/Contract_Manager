package taskmanager.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import taskmanager.taskmanager.config.ApiConfig;

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
