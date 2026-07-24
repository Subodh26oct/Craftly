package com.Subodh26oct.projects.lovable_clone.dto.usage;

import java.util.List;

public record UserUsageSummaryResponse(
        Long userId,
        String planName,
        Integer tokensUsedToday,
        Integer maxTokensPerDay,
        Integer tokensUsedThisMonth,
        Integer monthlyTokenLimit,
        Integer remainingTokensThisMonth,
        Double percentageUsedThisMonth,
        Boolean isLimitExceeded,
        List<UsageLogDto> recentActivity
) {}
