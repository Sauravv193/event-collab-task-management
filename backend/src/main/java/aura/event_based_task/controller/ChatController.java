package aura.event_based_task.controller;

import aura.event_based_task.model.User;
import aura.event_based_task.payload.ChatMessageDto;
import aura.event_based_task.service.AuthService;
import aura.event_based_task.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired private ChatService chatService;
    @Autowired private AuthService authService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage/{eventId}")
    // *** FIX: Added Principal as a method argument. ***
    // This is the standard and most reliable way for Spring to provide
    // the authenticated user's identity in a WebSocket context.
    public void sendMessage(@DestinationVariable Long eventId, @Payload ChatMessageDto chatMessageDto,
                            Principal principal) {
        try {
            if (principal == null) {
                logger.warn("Unauthenticated user attempted to send message to event {}", eventId);
                return;
            }

            String username = principal.getName();
            logger.debug("User {} sending message to event {}", username, eventId);

            User sender = authService.findByUsername(username);

            chatService.saveMessage(chatMessageDto, eventId, sender);

            // The DTO now includes the sender's username, which is what the frontend expects
            ChatMessageDto broadcastMessage = new ChatMessageDto(sender.getUsername(), chatMessageDto.getContent());
            messagingTemplate.convertAndSend("/topic/chat/" + eventId, broadcastMessage);

            logger.debug("Message sent successfully by {} to event {}", sender.getUsername(), eventId);
        } catch (Exception e) {
            logger.error("Error processing chat message for event {}: {}", eventId, e.getMessage(), e);
        }
    }
}
