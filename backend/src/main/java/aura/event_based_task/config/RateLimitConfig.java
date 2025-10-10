package aura.event_based_task.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

@Configuration
public class RateLimitConfig {

    @Value("${rate.limit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${rate.limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
        caffeineCacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .recordStats());
        return caffeineCacheManager;
    }

    @Bean
    public CacheManager rateLimitCacheManager() {
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager("rateLimit");
        caffeineCacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(100_000)
                .expireAfterWrite(1, TimeUnit.MINUTES));
        return caffeineCacheManager;
    }

    public int getRequestsPerMinute() {
        return requestsPerMinute;
    }

    public boolean isRateLimitEnabled() {
        return rateLimitEnabled;
    }
}