package com.Subodh26oct.projects.lovable_clone.dto.chat;

import jakarta.validation.constraints.NotBlank;

public record ChatSessionRequest(
        @NotBlank(message = "Title must not be blank")
        String title
) {}
