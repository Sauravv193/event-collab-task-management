package aura.event_based_task.dto;

import aura.event_based_task.model.ETaskStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskDto {
    private Long id;
    private String name;
    private String description;
    private ETaskStatus status;
    private UserDto assignedTo;
    private Long eventId;
    private String eventName;
    private Integer priority;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public TaskDto() {}

    public TaskDto(Long id, String name, String description, ETaskStatus status, 
                   UserDto assignedTo, Long eventId, String eventName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.assignedTo = assignedTo;
        this.eventId = eventId;
        this.eventName = eventName;
    }
}