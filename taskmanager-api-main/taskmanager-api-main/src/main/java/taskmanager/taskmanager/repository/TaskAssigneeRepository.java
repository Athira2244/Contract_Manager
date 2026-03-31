package taskmanager.taskmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import taskmanager.taskmanager.model.TaskAssignee;

import java.util.List;
import java.util.Optional;

public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, Long> {

    // Find current assignee for a task
    Optional<TaskAssignee> findByTaskIdAndIsAssignee(Long taskId, Integer isAssignee);

    // Find all assignments for a specific assignee where they are current
    List<TaskAssignee> findByAssigneeIdAndIsAssignee(Integer assigneeId, Integer isAssignee);

    // Find all assignments for a task (history)
    List<TaskAssignee> findByTaskId(Long taskId);

    // Update is_assignee flag for a task
    @Modifying
    @Query("UPDATE TaskAssignee ta SET ta.isAssignee = 0 WHERE ta.taskId = :taskId AND ta.isAssignee = 1")
    void deactivateCurrentAssignee(@Param("taskId") Long taskId);
}
