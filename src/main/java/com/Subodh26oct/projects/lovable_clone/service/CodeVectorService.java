package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.rag.CodeChunk;

import java.util.List;

public interface CodeVectorService {

    /**
     * Index or update a project file in the Qdrant Vector Database.
     * Chunks the source code and stores embeddings + payloads.
     */
    void indexFile(Long projectId, String path, String content);

    /**
     * Remove all vector chunks for a specific file path in a project.
     */
    void removeFileIndex(Long projectId, String path);

    /**
     * Search the Qdrant Vector Database for code chunks relevant to a query prompt.
     */
    List<CodeChunk> searchRelevantChunks(Long projectId, String prompt, int topK);
}
