package com.Subodh26oct.projects.lovable_clone.dto.chat;

public record StreamEvent(
        String event, // token, file_op, complete, error
        Object data
) {}
