package aura.event_based_task.service;

import aura.event_based_task.model.ChatMessage;
import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import aura.event_based_task.payload.ChatMessageDto;
import aura.event_based_task.repository.ChatMessageRepository;
import aura.event_based_task.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
// *** FIX: Import the Transactional annotation. ***
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private EventService eventService;
    @Autowired private EventRepository eventRepository;

    @PreAuthorize("hasPermission(#eventId, 'Event', 'MEMBER')")
    // *** FIX: Make the entire method a single database transaction. ***
    // This resolves the race condition by ensuring the event exists at the exact moment the message is saved.
    @Transactional
    public ChatMessage saveMessage(ChatMessageDto chatMessageDto, Long eventId, User sender) {
        // This check now happens inside the protected transaction
        Event event = eventService.getEventById(eventId);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSender(sender);
        chatMessage.setContent(chatMessageDto.getContent());
        chatMessage.setEvent(event);

        // *** FIX: Add the message to the event's collection to maintain consistency. ***
        // This is the key change to resolve the foreign key constraint error.
        event.getChatMessages().add(chatMessage);

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        logger.info("Chat message saved: eventId={}, user={}", eventId, sender.getUsername());
        return savedMessage;
    }

    @PreAuthorize("hasPermission(#eventId, 'Event', 'MEMBER')")
    @Transactional(readOnly = true) // Mark as read-only for performance
    public List<ChatMessageDto> getMessagesForEvent(Long eventId) {
        List<ChatMessage> messages = chatMessageRepository.findByEventIdOrderByTimestampAsc(eventId);
        logger.debug("Retrieved {} messages for event {}", messages.size(), eventId);
        return messages.stream()
                .map(msg -> new ChatMessageDto(msg.getSender().getUsername(), msg.getContent()))
                .collect(Collectors.toList());
    }
}

