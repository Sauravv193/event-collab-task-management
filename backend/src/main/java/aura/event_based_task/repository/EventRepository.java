package aura.event_based_task.repository;

import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

public interface EventRepository extends JpaRepository<Event, Long> {
    boolean existsByNameAndDate(String name, LocalDate date);
    boolean existsByName(String name);

    @Query("SELECT e FROM Event e JOIN e.members m WHERE m.id = :userId")
    Set<Event> findByMembers_Id(@Param("userId") Long userId);

    Optional<Event> findById(Long id);

    // *** NEW: Check if any events were created by a specific user. ***
    boolean existsByCreatedBy(User user);

    @Query("SELECT COUNT(e) > 0 FROM Event e JOIN e.members m WHERE e.id = :eventId AND m.username = :username")
    boolean isUserMember(@Param("eventId") Long eventId, @Param("username") String username);
}
