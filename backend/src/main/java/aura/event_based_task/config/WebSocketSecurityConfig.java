package aura.event_based_task.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // *** FIX: Allow all users to establish a connection. ***
                // The AuthChannelInterceptor will then handle authentication.
                .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.HEARTBEAT, SimpMessageType.UNSUBSCRIBE, SimpMessageType.DISCONNECT).permitAll()
                // Messages sent to the app (e.g., sending a chat) require authentication
                .simpDestMatchers("/app/**").authenticated()
                // Subscriptions to topics require authentication
                .simpSubscribeDestMatchers("/topic/**").authenticated()
                // Any other message type is denied to prevent unauthorized actions.
                .anyMessage().denyAll();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // This is required to allow connections from different origins (e.g., your React frontend)
        return true;
    }
}