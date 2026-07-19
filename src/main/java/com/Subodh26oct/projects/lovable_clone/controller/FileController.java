package com.Subodh26oct.projects.lovable_clone.controller;

import com.Subodh26oct.projects.lovable_clone.dto.project.FileContentResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileNode;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileSaveRequest;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.FileService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}")
public class FileController {

    private final FileService fileService;
    private final AuthUtil authUtil;

    /** GET /api/projects/{id}/files → workspace file tree */
    @GetMapping("/files")
    public ResponseEntity<List<FileNode>> getFileTree(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(fileService.getFileTree(projectId, userId));
    }

    /** GET /api/projects/{id}/files/content/{*path} → read file content */
    @GetMapping("/files/content/{*path}")
    public ResponseEntity<FileContentResponse> getFile(
            @PathVariable Long projectId,
            @PathVariable String path
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(fileService.getFileContent(projectId, path, userId));
    }

    /** PUT /api/projects/{id}/files → create or update a file */
    @PutMapping("/files")
    public ResponseEntity<FileContentResponse> saveFile(
            @PathVariable Long projectId,
            @Valid @RequestBody FileSaveRequest request
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(fileService.saveFile(projectId, request, userId));
    }

    /** DELETE /api/projects/{id}/files/content/{*path} → delete a file */
    @DeleteMapping("/files/content/{*path}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long projectId,
            @PathVariable String path
    ) {
        Long userId = authUtil.getCurrentUserId();
        fileService.deleteFile(projectId, path, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/projects/{id}/download → stream a ZIP of all project files.
     * Uses HttpServletResponse to stream directly to the client without buffering.
     */
    @GetMapping("/download")
    public void downloadProjectZip(
            @PathVariable Long projectId,
            HttpServletResponse response
    ) throws IOException {
        Long userId = authUtil.getCurrentUserId();
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"project-" + projectId + ".zip\"");
        fileService.writeProjectZip(projectId, userId, response.getOutputStream());
    }
}
