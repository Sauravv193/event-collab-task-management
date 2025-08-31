package aura.event_based_task.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    // *** FIX: Replaced @JsonIgnore with the correct annotation. ***
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Event event;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}