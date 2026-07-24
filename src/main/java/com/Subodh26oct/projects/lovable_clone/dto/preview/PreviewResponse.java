package com.Subodh26oct.projects.lovable_clone.dto.preview;

import com.Subodh26oct.projects.lovable_clone.enums.PreviewStatus;

import java.time.Instant;

public record PreviewResponse(
        Long id,
        Long projectId,
        String namespace,
        String podName,
        String previewUrl,
        PreviewStatus status,
        Instant startedAt,
        Instant terminatedAt,
        Instant createdAt
) {}
