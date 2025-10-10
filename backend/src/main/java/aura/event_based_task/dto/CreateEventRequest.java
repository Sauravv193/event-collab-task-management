package aura.event_based_task.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEventRequest {

    @NotBlank(message = "Event name is required")
    @Size(min = 3, max = 100, message = "Event name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Event description is required")
    @Size(min = 10, max = 500, message = "Event description must be between 10 and 500 characters")
    private String description;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be in the present or future")
    private LocalDate date;

    @Size(max = 100, message = "Location must be less than 100 characters")
    private String location;

    @Min(value = 1, message = "Maximum participants must be at least 1")
    @Max(value = 10000, message = "Maximum participants cannot exceed 10,000")
    private Integer maxParticipants;

    @Size(max = 50, message = "Category must be less than 50 characters")
    private String category;

    @Size(max = 200, message = "Tags must be less than 200 characters")
    private String tags;

    private Boolean isRecurring = false;

    @Size(max = 50, message = "Recurrence pattern must be less than 50 characters")
    private String recurrencePattern;

    @Pattern(regexp = "^(https?|ftp)://[^\\s/$.?#].[^\\s]*$", message = "Image URL must be a valid URL")
    private String imageUrl;
}