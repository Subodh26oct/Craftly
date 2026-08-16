package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.service.RedisRateLimiterService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
public class RedisRateLimiterServiceImpl implements RedisRateLimiterService {

    @Autowired(required = false)
    StringRedisTemplate redisTemplate;

    @Override
    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        if (redisTemplate == null) {
            return true; // Redis offline fallback mode
        }
        try {
            String redisKey = "ratelimit:" + key;
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);

            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            return currentRequests != null && currentRequests <= maxRequests;
        } catch (Exception e) {
            log.warn("Redis rate limiter unavailable (offline fallback enabled): {}", e.getMessage());
            return true;
        }
    }

    @Override
    public long getRemainingRequests(String key, int maxRequests) {
        if (redisTemplate == null) {
            return maxRequests;
        }
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
