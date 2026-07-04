package com.Subodh26oct.projects.lovable_clone.dto.project;

import java.time.Instant;

public record ProjectSummaryResponse(
        Long id,
        String projectName,
        Instant createdAt,
        Instant updatedAt
) {
}
