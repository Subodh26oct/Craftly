package com.Subodh26oct.projects.lovable_clone.dto.event;

import java.time.Instant;

public record PreviewLogEvent(
        Long projectId,
        Long previewId,
        String logMessage,
        Instant timestamp
) {}
