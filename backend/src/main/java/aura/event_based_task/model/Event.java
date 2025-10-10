package aura.event_based_task.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "events", indexes = {
    @Index(name = "idx_event_date", columnList = "date"),
    @Index(name = "idx_event_creator", columnList = "creator_id"),
    @Index(name = "idx_event_category", columnList = "category"),
    @Index(name = "idx_event_created_at", columnList = "created_at"),
    @Index(name = "idx_event_name", columnList = "name")
})
@Getter
@Setter
@ToString(exclude = {"members", "tasks", "chatMessages"})
@EqualsAndHashCode(exclude = {"members", "tasks", "chatMessages"})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    @Size(max = 100, message = "Event name must be less than 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Event description is required")
    @Size(max = 500, message = "Event description must be less than 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be in the present or future")
    @Column(nullable = false)
    private LocalDate date;

    @Size(max = 100, message = "Location must be less than 100 characters")
    private String location;

    // *** FIX: Add the maxParticipants field. ***
    // Using Integer allows it to be null, which we can treat as "unlimited".
    @Min(value = 1, message = "Maximum participants must be at least 1")
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Size(max = 50, message = "Category must be less than 50 characters")
    @Column(name = "category")
    private String category;
    
    @Size(max = 200, message = "Tags must be less than 200 characters")
    @Column(name = "tags")
    private String tags; // Comma-separated tags
    
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    @Size(max = 50, message = "Recurrence pattern must be less than 50 characters")
    @Column(name = "recurrence_pattern")
    private String recurrencePattern; // DAILY, WEEKLY, MONTHLY, etc.
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", nullable = false)
    private User createdBy;

    @ManyToMany
    @JoinTable(
            name = "event_members",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Task> tasks = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChatMessage> chatMessages = new HashSet<>();

    public Event() {
    }

    public Event(String name, String description, LocalDate date, String location, User createdBy) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.location = location;
        this.createdBy = createdBy;
        this.members.add(createdBy);
    }

    public void addMember(User user) {
        this.members.add(user);
        if (user.getEvents() != null) {
            user.getEvents().add(this);
        }
    }

    public void removeMember(User user) {
        this.members.remove(user);
        if (user.getEvents() != null) {
            user.getEvents().remove(this);
        }
    }

    public boolean isExpired() {
        return date != null && date.isBefore(LocalDate.now());
    }
}

