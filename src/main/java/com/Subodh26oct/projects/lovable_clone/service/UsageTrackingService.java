package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.usage.ProjectUsageSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.dto.usage.UserUsageSummaryResponse;

public interface UsageTrackingService {
    UserUsageSummaryResponse getUserUsage(Long userId);
    ProjectUsageSummaryResponse getProjectUsage(Long projectId, Long userId);
    void checkRateLimit(Long userId, int estimatedTokens);
    void recordUsage(Long userId, Long projectId, String action, int tokensUsed, int durationMs);
}
