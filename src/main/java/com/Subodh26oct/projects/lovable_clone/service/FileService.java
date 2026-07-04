package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.project.FileContentResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileNode;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface FileService {
    List<FileNode> getFileTree(Long projectId,Long userId);

    FileContentResponse getFileContent(Long projectId, String path, Long userId);
}
