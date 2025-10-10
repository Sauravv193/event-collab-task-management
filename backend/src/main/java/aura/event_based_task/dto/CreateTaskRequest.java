package aura.event_based_task.dto;

import aura.event_based_task.model.ETaskStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Task name is required")
    @Size(min = 3, max = 100, message = "Task name must be between 3 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Task description must be less than 1000 characters")
    private String description;

    @NotNull(message = "Task status is required")
    private ETaskStatus status = ETaskStatus.TODO;

    @Min(value = 1, message = "Priority must be between 1 and 5")
    @Max(value = 5, message = "Priority must be between 1 and 5")
    private Integer priority = 3;

    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;

    @Min(value = 1, message = "Estimated hours must be at least 1")
    @Max(value = 1000, message = "Estimated hours cannot exceed 1000")
    private Integer estimatedHours;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    private Long assignedToUserId;
}