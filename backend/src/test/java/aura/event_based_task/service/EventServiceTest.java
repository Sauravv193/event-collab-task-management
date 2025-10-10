package aura.event_based_task.service;

import aura.event_based_task.dto.CreateEventRequest;
import aura.event_based_task.dto.PaginatedResponse;
import aura.event_based_task.exception.ResourceNotFoundException;
import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import aura.event_based_task.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private AuthService authService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private EventService eventService;

    private User testUser;
    private Event testEvent;
    private CreateEventRequest createEventRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setCreatedAt(LocalDateTime.now());

        testEvent = new Event();
        testEvent.setId(1L);
        testEvent.setName("Test Event");
        testEvent.setDescription("Test Description");
        testEvent.setDate(LocalDate.now().plusDays(1));
        testEvent.setLocation("Test Location");
        testEvent.setCreatedBy(testUser);
        testEvent.setCreatedAt(LocalDateTime.now());

        createEventRequest = new CreateEventRequest();
        createEventRequest.setName("New Event");
        createEventRequest.setDescription("New Event Description");
        createEventRequest.setDate(LocalDate.now().plusDays(7));
        createEventRequest.setLocation("New Location");
        createEventRequest.setCategory("Conference");
    }

    @Test
    void testGetAllEvents() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Event> eventPage = new PageImpl<>(Arrays.asList(testEvent));
        when(eventRepository.findAll(any(Pageable.class))).thenReturn(eventPage);

        // When
        PaginatedResponse<Event> result = eventService.getAllEvents(0, 10, null, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testEvent.getName(), result.getContent().get(0).getName());
        verify(eventRepository).findAll(any(Pageable.class));
    }

    @Test
    void testGetEventById_Success() {
        // Given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(testEvent));

        // When
        Event result = eventService.getEventById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testEvent.getName(), result.getName());
        verify(eventRepository).findById(1L);
    }

    @Test
    void testGetEventById_NotFound() {
        // Given
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            eventService.getEventById(999L);
        });
        verify(eventRepository).findById(999L);
    }

    @Test
    void testCreateEvent() {
        // Given
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);

        // When
        Event result = eventService.createEvent(createEventRequest, testUser);

        // Then
        assertNotNull(result);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void testDeleteEvent() {
        // Given
        when(eventRepository.existsById(1L)).thenReturn(true);

        // When
        eventService.deleteEvent(1L);

        // Then
        verify(eventRepository).deleteById(1L);
        verify(messagingTemplate).convertAndSend(eq("/topic/events/deleted"), eq(1L));
    }

    @Test
    void testAddUserToEvent_Success() {
        // Given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(testEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);

        // When
        Event result = eventService.addUserToEvent(1L, testUser);

        // Then
        assertNotNull(result);
        verify(eventRepository).findById(1L);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void testAddUserToEvent_ExpiredEvent() {
        // Given
        testEvent.setDate(LocalDate.now().minusDays(1)); // Past date
        when(eventRepository.findById(1L)).thenReturn(Optional.of(testEvent));

        // When & Then
        assertThrows(IllegalStateException.class, () -> {
            eventService.addUserToEvent(1L, testUser);
        });
    }
}