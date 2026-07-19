package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.project.FileContentResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileNode;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileSaveRequest;

import java.io.OutputStream;
import java.util.List;

public interface FileService {

    /** Returns a flat list of file metadata nodes for a project's workspace. */
    List<FileNode> getFileTree(Long projectId, Long userId);

    /** Returns the text content of a single file. */
    FileContentResponse getFileContent(Long projectId, String path, Long userId);

    /**
     * Create or update a file in the workspace.
     * If the file already exists its content and updatedAt timestamp are refreshed.
     *
     * @return the updated file metadata
     */
    FileContentResponse saveFile(Long projectId, FileSaveRequest request, Long userId);

    /**
     * Delete a file from the workspace and from object storage.
     *
     * @param path the logical path of the file inside the project
     */
    void deleteFile(Long projectId, String path, Long userId);

    /**
     * Write a ZIP archive of all project files into the provided OutputStream.
     * This is used by the download-all endpoint to stream the response.
     */
    void writeProjectZip(Long projectId, Long userId, OutputStream outputStream);
}
