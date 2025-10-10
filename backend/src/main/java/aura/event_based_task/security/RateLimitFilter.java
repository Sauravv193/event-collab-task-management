package aura.event_based_task.security;

import aura.event_based_task.config.RateLimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String RATE_LIMIT_CACHE = "rateLimit";

    @Autowired
    private RateLimitConfig rateLimitConfig;

    @Autowired
    private CacheManager rateLimitCacheManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        if (!rateLimitConfig.isRateLimitEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientId = getClientIdentifier(request);
        String requestPath = request.getRequestURI();
        
        // Apply rate limiting only to authentication endpoints for now
        if (isRateLimitedEndpoint(requestPath)) {
            if (isRateLimitExceeded(clientId)) {
                handleRateLimitExceeded(response, clientId);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Use IP address as client identifier
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean isRateLimitedEndpoint(String requestPath) {
        return requestPath.startsWith("/api/auth/") || 
               requestPath.startsWith("/api/v1/events") ||
               requestPath.startsWith("/api/v1/tasks");
    }

    private boolean isRateLimitExceeded(String clientId) {
        Cache cache = rateLimitCacheManager.getCache(RATE_LIMIT_CACHE);
        if (cache == null) {
            return false;
        }

        Cache.ValueWrapper wrapper = cache.get(clientId);
        AtomicInteger requestCount;
        
        if (wrapper == null) {
            requestCount = new AtomicInteger(1);
            cache.put(clientId, requestCount);
            return false;
        } else {
            requestCount = (AtomicInteger) wrapper.get();
            if (requestCount != null) {
                int currentCount = requestCount.incrementAndGet();
                if (currentCount > rateLimitConfig.getRequestsPerMinute()) {
                    logger.warn("Rate limit exceeded for client: {} with {} requests", clientId, currentCount);
                    return true;
                }
            }
        }
        
        return false;
    }

    private void handleRateLimitExceeded(HttpServletResponse response, String clientId) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorResponse.put("error", "Too Many Requests");
        errorResponse.put("message", "Rate limit exceeded. Please try again later.");
        errorResponse.put("path", "Rate Limited");

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        response.getWriter().flush();
    }
}