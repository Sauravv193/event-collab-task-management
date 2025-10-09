package aura.event_based_task.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class EventDto {
    private Long id;
    private String name;
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    private String location;
    private Integer maxParticipants;
    private UserDto createdBy;
    private Set<UserDto> members;
    private Integer taskCount;
    private Integer memberCount;
    private Boolean isExpired;
    private Boolean userIsMember;

    // Constructor for basic event info
    public EventDto(Long id, String name, String description, LocalDate date, 
                   String location, Integer maxParticipants, UserDto createdBy) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.location = location;
        this.maxParticipants = maxParticipants;
        this.createdBy = createdBy;
        this.isExpired = date != null && date.isBefore(LocalDate.now());
    }

    public EventDto() {}
}