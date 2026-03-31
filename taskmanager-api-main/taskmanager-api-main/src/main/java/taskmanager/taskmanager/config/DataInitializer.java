package taskmanager.taskmanager.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import taskmanager.taskmanager.model.TaskStatusEntity;
import taskmanager.taskmanager.repository.TaskStatusRepository;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(TaskStatusRepository taskStatusRepository) {
        return args -> {
            if (taskStatusRepository.count() == 0) {
                System.out.println("Initializing Task Statuses...");
                taskStatusRepository.saveAll(Arrays.asList(
                    new TaskStatusEntity(0, "PENDING"),
                    new TaskStatusEntity(1, "IN_PROGRESS"),
                    new TaskStatusEntity(2, "COMPLETED")
                ));
                System.out.println("Task Statuses Initialized.");
            }
        };
    }
}
