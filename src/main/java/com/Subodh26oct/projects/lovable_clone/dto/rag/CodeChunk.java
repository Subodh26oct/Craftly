package com.Subodh26oct.projects.lovable_clone.dto.rag;

public record CodeChunk(
        Long projectId,
        String path,
        String snippet,
        int startLine,
        int endLine,
        double score
) {}
