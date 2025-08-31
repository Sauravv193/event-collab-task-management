package aura.event_based_task.security;

import aura.event_based_task.model.Event;
import aura.event_based_task.model.Task;
import aura.event_based_task.repository.EventRepository;
import aura.event_based_task.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private static final Logger logger = LoggerFactory.getLogger(CustomPermissionEvaluator.class);

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            logger.warn("User not authenticated or principal is not UserDetailsImpl");
            return false;
        }

        // *** FIX: Get the full user details, including the ID, from the authentication principal. ***
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        String username = userDetails.getUsername(); // Keep for member check
        String perm = (String) permission;

        logger.debug("Checking permission: userId={}, targetType={}, targetId={}, permission={}",
                userId, targetType, targetId, perm);

        if ("Event".equalsIgnoreCase(targetType)) {
            Long eventId = (Long) targetId;
            // Pass the user's ID to the permission check method
            boolean hasPerm = hasEventPermission(userId, username, eventId, perm);
            logger.debug("Event permission result: {}", hasPerm);
            return hasPerm;
        }

        if ("Task".equalsIgnoreCase(targetType)) {
            Long taskId = (Long) targetId;
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null || task.getEvent() == null) {
                logger.warn("Task not found or has no event association");
                return false;
            }
            // Pass the user's ID to the permission check method
            boolean hasPerm = hasEventPermission(userId, username, task.getEvent().getId(), perm);
            logger.debug("Task permission result: {}", hasPerm);
            return hasPerm;
        }

        logger.warn("Unknown target type: {}", targetType);
        return false;
    }

    private boolean hasEventPermission(Long userId, String username, Long eventId, String perm) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            if ("ADMIN".equals(perm)) {
                // *** FIX: Compare numeric user IDs instead of usernames for a more reliable check. ***
                boolean isAdmin = event.getCreatedBy().getId().equals(userId);
                logger.debug("Admin check: userId={}, creatorId={}, result={}",
                        userId, event.getCreatedBy().getId(), isAdmin);
                return isAdmin;
            } else if ("MEMBER".equals(perm)) {
                // The member check can still use username as it's efficient
                boolean isMember = eventRepository.isUserMember(eventId, username);
                logger.debug("Member check: username={}, eventId={}, result={}", username, eventId, isMember);
                return isMember;
            }
        } catch (Exception e) {
            logger.error("Error checking event permission for eventId " + eventId, e);
            return false;
        }
        logger.warn("Unknown permission type: {}", perm);
        return false;
    }
}
