package aura.event_based_task.service;

import aura.event_based_task.model.Event;
import aura.event_based_task.model.Task;
import aura.event_based_task.repository.EventRepository;
import aura.event_based_task.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired private TaskRepository taskRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private EventService eventService;
    @Autowired private EventRepository eventRepository;

    @PreAuthorize("hasPermission(#eventId, 'Event', 'MEMBER')")
    public List<Task> findTasksByEventId(Long eventId) {
        return taskRepository.findByEventId(eventId);
    }

    @Transactional
    @PreAuthorize("hasPermission(#eventId, 'Event', 'MEMBER')")
    public Task createTask(Task task, Long eventId) {
        Event event = eventService.getEventById(eventId);

        // *** NEW: Prevent task creation for events that have already passed. ***
        if (event.getDate().isBefore(LocalDate.now())) {
            throw new AccessDeniedException("Cannot create tasks for an event that has already finished.");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!eventRepository.isUserMember(eventId, username)) {
            logger.warn("User {} is not a member of event {}", username, eventId);
            throw new AccessDeniedException("User is not a member of this event");
        }

        task.setEvent(event);
        Task savedTask = taskRepository.save(task);
        messagingTemplate.convertAndSend("/topic/tasks/" + eventId, savedTask);
        logger.info("Task created: id={}, eventId={}, user={}", savedTask.getId(), eventId, username);
        return savedTask;
    }

    @Transactional
    @PreAuthorize("hasPermission(#taskId, 'Task', 'MEMBER')")
    public Optional<Task> updateTask(Long taskId, Task taskDetails) {
        return taskRepository.findById(taskId).map(task -> {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            task.setName(taskDetails.getName());
            task.setDescription(taskDetails.getDescription());
            task.setStatus(taskDetails.getStatus());
            task.setAssignedTo(taskDetails.getAssignedTo());

            Task updatedTask = taskRepository.save(task);
            messagingTemplate.convertAndSend("/topic/tasks/" + updatedTask.getEvent().getId(), updatedTask);
            logger.info("Task updated: id={}, user={}", taskId, username);
            return updatedTask;
        });
    }

    @Transactional
    @PreAuthorize("hasPermission(#taskId, 'Task', 'ADMIN')")
    public boolean deleteTask(Long taskId) {
        return taskRepository.findById(taskId).map(task -> {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long eventId = task.getEvent().getId();
            taskRepository.delete(task);
            messagingTemplate.convertAndSend("/topic/tasks/deleted/" + eventId,
                    Map.of("deletedTaskId", taskId));
            logger.info("Task deleted: id={}, user={}", taskId, username);
            return true;
        }).orElse(false);
    }
}
