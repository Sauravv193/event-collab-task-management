package aura.event_based_task.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_username", columnList = "username"),
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_created_at", columnList = "created_at")
})
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @Email
    @Size(max = 50)
    @Column(unique = true)
    private String email;
    
    @Size(max = 100)
    private String fullName;
    
    @Size(max = 500)
    private String bio;
    
    @Size(max = 255)
    private String avatarUrl;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ElementCollection(targetClass = ERole.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name")
    private Set<ERole> roles = new HashSet<>();

    // *** FIX: Added cascade types to help Hibernate manage the relationship. ***
    @ManyToMany(mappedBy = "members", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Event> events = new HashSet<>();

    // *** NEW: This method runs automatically before a user is deleted. ***
    // It goes through all events the user is a member of and removes them,
    // which cleans up the 'event_members' join table and prevents database errors.
    @PreRemove
    private void preRemove() {
        for (Event event : events) {
            event.getMembers().remove(this);
        }
    }
}
