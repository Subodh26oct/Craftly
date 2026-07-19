package com.Subodh26oct.projects.lovable_clone.dto.chat;

import java.util.List;

public record AIResponse(
        String explanation,
        List<FileOperation> fileOperations
) {
    public record FileOperation(
            String type, // CREATE_OR_UPDATE, DELETE
            String path,
            String content
    ) {}
}
