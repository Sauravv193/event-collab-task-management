package aura.event_based_task.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        MessageMatcherDelegatingAuthorizationManager.Builder messages = MessageMatcherDelegatingAuthorizationManager.builder();
        
        messages
            // Allow all users to establish a connection
            .nullDestMatcher().permitAll()
            // Allow CONNECT, HEARTBEAT, UNSUBSCRIBE, DISCONNECT
            .simpTypeMatchers(SimpMessageType.CONNECT, 
                            SimpMessageType.HEARTBEAT,
                            SimpMessageType.UNSUBSCRIBE,
                            SimpMessageType.DISCONNECT).permitAll()
            // Require authentication for app destinations
            .simpDestMatchers("/app/**").authenticated()
            // Require authentication for topic subscriptions
            .simpSubscribeDestMatchers("/topic/**").authenticated()
            // Deny any other message type
            .anyMessage().denyAll();
            
        return messages.build();
    }
}