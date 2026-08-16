package com.Subodh26oct.projects.lovable_clone.security;

import com.Subodh26oct.projects.lovable_clone.service.RedisRateLimiterService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RateLimitInterceptor implements HandlerInterceptor {

    RedisRateLimiterService redisRateLimiterService;

    static final int MAX_REQUESTS_PER_MINUTE = 100;
    static final int WINDOW_SECONDS = 60;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIp(request);
        String clientKey = "ip:" + clientIp;

        boolean allowed = redisRateLimiterService.isAllowed(clientKey, MAX_REQUESTS_PER_MINUTE, WINDOW_SECONDS);
        long remaining = redisRateLimiterService.getRemainingRequests(clientKey, MAX_REQUESTS_PER_MINUTE);

        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (!allowed) {
            log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("""
                    {
                        "status": "429 TOO_MANY_REQUESTS",
                        "message": "Global rate limit exceeded (100 requests/min). Please slow down requests.",
                        "timestamp": "%s"
                    }
                    """.formatted(java.time.Instant.now().toString()));
            return false;
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
