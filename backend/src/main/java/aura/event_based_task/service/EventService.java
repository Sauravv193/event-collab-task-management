package aura.event_based_task.service;

import aura.event_based_task.dto.CreateEventRequest;
import aura.event_based_task.dto.PaginatedResponse;
import aura.event_based_task.exception.ResourceNotFoundException;
import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import aura.event_based_task.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired private EventRepository eventRepository;
    @Autowired private AuthService authService;
    // *** FIX: Inject the messaging template to send WebSocket messages. ***
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Cacheable(value = "events", key = "#page + '_' + #size + '_' + (#category != null ? #category : 'all') + '_' + (#search != null ? #search : 'all')")
    public PaginatedResponse<Event> getAllEvents(int page, int size, String category, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Event> eventPage;
        
        if (category != null && search != null) {
            eventPage = eventRepository.findByCategoryContainingIgnoreCaseAndNameContainingIgnoreCase(category, search, pageable);
        } else if (category != null) {
            eventPage = eventRepository.findByCategoryContainingIgnoreCase(category, pageable);
        } else if (search != null) {
            eventPage = eventRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search, pageable);
        } else {
            eventPage = eventRepository.findAll(pageable);
        }
        
        return PaginatedResponse.of(
            eventPage.getContent(),
            eventPage.getNumber(),
            eventPage.getSize(),
            eventPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public Set<Event> getMyEvents(String username) {
        User user = authService.findByUsername(username);
        return eventRepository.findByMembers_Id(user.getId());
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
    }

    @Transactional
    public Event createEvent(CreateEventRequest request, User creator) {
        Event event = new Event();
        BeanUtils.copyProperties(request, event);
        event.setCreatedBy(creator);
        event.getMembers().add(creator);
        Event savedEvent = eventRepository.save(event);
        logger.info("Event created: id={}, creator={}", savedEvent.getId(), creator.getUsername());
        return savedEvent;
    }

    @Transactional
    @PreAuthorize("hasPermission(#eventId, 'Event', 'ADMIN')")
    public void deleteEvent(Long eventId) {
        if (eventRepository.existsById(eventId)) {
            eventRepository.deleteById(eventId);
            logger.info("Event deleted: id={}", eventId);
            // *** FIX: Broadcast the ID of the deleted event to all clients. ***
            messagingTemplate.convertAndSend("/topic/events/deleted", eventId);
        }
    }

    @Transactional
    public Event addUserToEvent(Long eventId, User user) {
        Event event = getEventById(eventId);

        if (event.isExpired()) {
            throw new IllegalStateException("This event has already finished and cannot be joined.");
        }

        if (event.getMaxParticipants() != null && event.getMembers().size() >= event.getMaxParticipants()) {
            throw new IllegalStateException("The event is already full.");
        }

        event.addMember(user);
        return eventRepository.save(event);
    }

    @Transactional
    @PreAuthorize("hasPermission(#eventId, 'Event', 'ADMIN')")
    public Event removeUserFromEvent(Long eventId, User user) {
        Event event = getEventById(eventId);
        event.removeMember(user);
        return eventRepository.save(event);
    }

    public boolean isUserMemberOfEvent(Long eventId, String username) {
        return eventRepository.isUserMember(eventId, username);
    }

    @Transactional(readOnly = true)
    public Set<User> getEventMembers(Long eventId) {
        Event event = getEventById(eventId);
        return event.getMembers();
    }
}

