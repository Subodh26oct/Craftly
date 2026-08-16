package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.service.RedisRateLimiterService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RedisRateLimiterServiceImpl implements RedisRateLimiterService {

    StringRedisTemplate redisTemplate;

    @Override
    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        try {
            String redisKey = "ratelimit:" + key;
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);

            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            return currentRequests != null && currentRequests <= maxRequests;
        } catch (Exception e) {
            log.warn("Redis rate limiter unavailable (offline mode enabled): {}", e.getMessage());
            return true; // Graceful fallback: allow request if Redis is offline
        }
    }

    @Override
    public long getRemainingRequests(String key, int maxRequests) {
        try {
            String redisKey = "ratelimit:" + key;
            String val = redisTemplate.opsForValue().get(redisKey);
            long current = (val != null) ? Long.parseLong(val) : 0L;
            return Math.max(0, maxRequests - current);
        } catch (Exception e) {
            return maxRequests;
        }
    }
}
