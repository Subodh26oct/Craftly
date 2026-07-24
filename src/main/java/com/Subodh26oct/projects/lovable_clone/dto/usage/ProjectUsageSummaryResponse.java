package com.Subodh26oct.projects.lovable_clone.dto.usage;

import java.util.List;

public record ProjectUsageSummaryResponse(
        Long projectId,
        String projectName,
        Integer totalTokensUsed,
        Long totalRequestsCount,
        List<UsageLogDto> recentActivity
) {}
