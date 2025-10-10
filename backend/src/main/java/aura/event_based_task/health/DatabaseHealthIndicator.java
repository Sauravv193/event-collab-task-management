package aura.event_based_task.health;

import aura.event_based_task.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Health health() {
        try {
            // Simple database connectivity check
            long userCount = userRepository.count();
            
            if (userCount >= 0) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("userCount", userCount)
                    .withDetail("status", "Connection successful")
                    .build();
            } else {
                return Health.down()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("error", "Unable to count users")
                    .build();
            }
        } catch (Exception ex) {
            return Health.down()
                .withDetail("database", "PostgreSQL")
                .withDetail("error", ex.getMessage())
                .build();
        }
    }
}