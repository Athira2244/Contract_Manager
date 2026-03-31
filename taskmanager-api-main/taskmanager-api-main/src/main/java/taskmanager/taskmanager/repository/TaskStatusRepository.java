package taskmanager.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import taskmanager.taskmanager.model.TaskStatusEntity;

public interface TaskStatusRepository extends JpaRepository<TaskStatusEntity, Integer> {
}
