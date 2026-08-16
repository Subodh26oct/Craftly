package com.Subodh26oct.projects.lovable_clone.dto.event;

import java.time.Instant;

public record AIGenerationEvent(
        Long projectId,
        Long userId,
        String prompt,
        int tokensUsed,
        Instant timestamp
) {}
