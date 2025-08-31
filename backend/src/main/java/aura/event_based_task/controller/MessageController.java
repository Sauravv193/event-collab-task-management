package aura.event_based_task.controller;

import aura.event_based_task.payload.ChatMessageDto;
import aura.event_based_task.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MessageController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/events/{eventId}/messages")
    public List<ChatMessageDto> getChatHistory(@PathVariable Long eventId) {
        return chatService.getMessagesForEvent(eventId);
    }
}