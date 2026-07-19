package com.Subodh26oct.projects.lovable_clone.dto.chat;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @NotBlank(message = "Message content must not be blank")
        String content
) {}
