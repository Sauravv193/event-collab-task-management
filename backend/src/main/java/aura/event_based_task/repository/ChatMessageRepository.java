package aura.event_based_task.repository;

import aura.event_based_task.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByEventIdOrderByTimestampAsc(Long eventId);
}