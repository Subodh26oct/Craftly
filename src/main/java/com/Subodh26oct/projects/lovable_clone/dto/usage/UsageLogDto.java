package com.Subodh26oct.projects.lovable_clone.dto.usage;

import java.time.Instant;

public record UsageLogDto(
        Long id,
        Long userId,
        Long projectId,
        String action,
        Integer tokensUsed,
        Integer durationMs,
        Instant createdAt
) {}
