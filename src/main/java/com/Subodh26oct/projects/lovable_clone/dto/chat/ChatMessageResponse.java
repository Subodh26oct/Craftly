package com.Subodh26oct.projects.lovable_clone.dto.chat;

import com.Subodh26oct.projects.lovable_clone.enums.MessageRole;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        String content,
        MessageRole role,
        String toolCalls,
        Instant createdAt
) {}
