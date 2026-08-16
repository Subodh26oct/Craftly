package com.Subodh26oct.projects.lovable_clone.service;

public interface RedisRateLimiterService {
    boolean isAllowed(String key, int maxRequests, int windowSeconds);
    long getRemainingRequests(String key, int maxRequests);
}
