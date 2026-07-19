package com.Subodh26oct.projects.lovable_clone.dto.chat;

import java.time.Instant;

public record ChatSessionResponse(
        Long id,
        String title,
        Instant createdAt,
        Instant updatedAt
) {}
