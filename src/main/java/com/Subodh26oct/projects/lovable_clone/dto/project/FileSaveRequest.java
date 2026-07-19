package com.Subodh26oct.projects.lovable_clone.dto.project;

import jakarta.validation.constraints.NotBlank;

public record FileSaveRequest(
        @NotBlank(message = "path must not be blank")
        String path,

        @NotBlank(message = "content must not be blank")
        String content,

        /** Optional MIME type hint, defaults to text/plain */
        String contentType
) {
    public String resolvedContentType() {
        return (contentType != null && !contentType.isBlank()) ? contentType : "text/plain";
    }
}
