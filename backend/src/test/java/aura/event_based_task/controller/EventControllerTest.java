package aura.event_based_task.controller;

import aura.event_based_task.dto.CreateEventRequest;
import aura.event_based_task.dto.PaginatedResponse;
import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import aura.event_based_task.service.AuthService;
import aura.event_based_task.service.EventService;
import aura.event_based_task.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private Event testEvent;
    private User testUser;
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
        testEvent.setMembers(new HashSet<>());

        createEventRequest = new CreateEventRequest();
        createEventRequest.setName("New Event");
        createEventRequest.setDescription("New Event Description");
        createEventRequest.setDate(LocalDate.now().plusDays(7));
        createEventRequest.setLocation("New Location");
    }

    @Test
    void testGetAllEvents() throws Exception {
        // Given
        PaginatedResponse<Event> paginatedResponse = PaginatedResponse.of(
            Arrays.asList(testEvent), 0, 10, 1L);
        when(eventService.getAllEvents(0, 10, null, null)).thenReturn(paginatedResponse);

        // When & Then
        mockMvc.perform(get("/api/events")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Test Event"));
    }

    @Test
    void testGetEventById() throws Exception {
        // Given
        when(eventService.getEventById(1L)).thenReturn(testEvent);

        // When & Then
        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Event"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCreateEvent() throws Exception {
        // Given
        when(authService.findByUsername("testuser")).thenReturn(testUser);
        when(eventService.createEvent(any(CreateEventRequest.class), eq(testUser)))
                .thenReturn(testEvent);

        // When & Then
        mockMvc.perform(post("/api/events")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createEventRequest)))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testJoinEvent() throws Exception {
        // Given
        when(authService.findByUsername("testuser")).thenReturn(testUser);
        when(eventService.addUserToEvent(1L, testUser)).thenReturn(testEvent);

        // When & Then
        mockMvc.perform(post("/api/events/1/join")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testIsUserMember() throws Exception {
        // Given
        when(eventService.isUserMemberOfEvent(1L, "testuser")).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/api/events/1/is-member"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpected(content().string("true"));
    }
}