package aura.event_based_task.controller;

import aura.event_based_task.dto.CreateEventRequest;
import aura.event_based_task.dto.PaginatedResponse;
import aura.event_based_task.exception.ResourceNotFoundException;
import aura.event_based_task.model.Event;
import aura.event_based_task.model.User;
import aura.event_based_task.security.UserDetailsImpl;
import aura.event_based_task.service.AuthService;
import aura.event_based_task.service.EventService;
import aura.event_based_task.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/events")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Events", description = "Event management operations")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    @Autowired private EventService eventService;
    @Autowired private AuthService authService;
    @Autowired private UserService userService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Get all events",
        description = "Retrieve paginated list of events with optional filtering by category and search term"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved events"
    )
    public ResponseEntity<PaginatedResponse<Event>> getAllEvents(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search) {
        PaginatedResponse<Event> events = eventService.getAllEvents(page, size, category, search);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/my-events")
    public ResponseEntity<Set<Event>> getMyEvents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(eventService.getMyEvents(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Create a new event",
        description = "Create a new event with the provided details"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Event> createEvent(@Valid @RequestBody CreateEventRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User creator = authService.findByUsername(userDetails.getUsername());
        Event createdEvent = eventService.createEvent(request, creator);
        return ResponseEntity.ok(createdEvent);
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasPermission(#eventId, 'Event', 'ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<Event> joinEvent(@PathVariable Long eventId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = authService.findByUsername(userDetails.getUsername());
        Event updatedEvent = eventService.addUserToEvent(eventId, user);
        return ResponseEntity.ok(updatedEvent);
    }

    @GetMapping("/{eventId}/is-member")
    public ResponseEntity<Boolean> isUserMember(@PathVariable Long eventId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(false);
        }
        boolean isMember = eventService.isUserMemberOfEvent(eventId, userDetails.getUsername());
        return ResponseEntity.ok(isMember);
    }

    @GetMapping("/{eventId}/members")
    @PreAuthorize("hasPermission(#eventId, 'Event', 'MEMBER')")
    public ResponseEntity<Set<String>> getEventMembers(@PathVariable Long eventId) {
        Set<User> members = eventService.getEventMembers(eventId);
        Set<String> memberUsernames = members.stream().map(User::getUsername).collect(Collectors.toSet());
        return ResponseEntity.ok(memberUsernames);
    }

    @DeleteMapping("/{eventId}/members/{userId}")
    @PreAuthorize("hasPermission(#eventId, 'Event', 'ADMIN')")
    public ResponseEntity<?> removeMember(@PathVariable Long eventId, @PathVariable Long userId) {
        try {
            User user = userService.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            eventService.removeUserFromEvent(eventId, user);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}