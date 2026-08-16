package com.Subodh26oct.projects.lovable_clone.dto.event;

import java.time.Instant;

public record UsageAuditEvent(
        Long userId,
        String action,
        int tokensUsed,
        String metadata,
        Instant timestamp
) {}
