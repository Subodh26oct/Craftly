package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.project.FileContentResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileNode;
import com.Subodh26oct.projects.lovable_clone.dto.project.FileSaveRequest;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.entity.ProjectFile;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.error.ResourceNotFoundException;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectFileRepository;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectMemberRepository;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import com.Subodh26oct.projects.lovable_clone.service.FileService;
import com.Subodh26oct.projects.lovable_clone.service.StorageService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class FileServiceImpl implements FileService {

    ProjectRepository projectRepository;
    ProjectFileRepository projectFileRepository;
    ProjectMemberRepository projectMemberRepository;
    UserRepository userRepository;
    StorageService storageService;
    com.Subodh26oct.projects.lovable_clone.service.CodeVectorService codeVectorService;

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public List<FileNode> getFileTree(Long projectId, Long userId) {
        assertAccess(projectId, userId);
        List<ProjectFile> files = projectFileRepository.findByProjectId(projectId);
        return files.stream()
                .map(f -> new FileNode(f.getPath(), f.getUpdatedAt(), null, "file"))
                .toList();
    }

    @Override
    public FileContentResponse getFileContent(Long projectId, String path, Long userId) {
        assertAccess(projectId, userId);
        // Trim leading slash added by Spring's wildcard path variable capture
        String normalPath = normalizePath(path);

        ProjectFile file = projectFileRepository
                .findByProjectIdAndPath(projectId, normalPath)
                .orElseThrow(() -> new ResourceNotFoundException("File", normalPath));

        String content = storageService.get(file.getMinioObjectKey());
        return new FileContentResponse(normalPath, content);
    }

    // ── WRITE ─────────────────────────────────────────────────────────────────

    @Override
    public FileContentResponse saveFile(Long projectId, FileSaveRequest request, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        User actor = userRepository.getReferenceById(userId);

        String normalPath = normalizePath(request.path());
        // Object key is globally unique per project: "projects/{id}/{path}"
        String objectKey = buildObjectKey(projectId, normalPath);

        // Upsert: find existing or build new
        ProjectFile file = projectFileRepository
                .findByProjectIdAndPath(projectId, normalPath)
                .map(existing -> {
                    existing.setUpdatedBy(actor);
                    return existing;
                })
                .orElseGet(() -> ProjectFile.builder()
                        .project(project)
                        .path(normalPath)
                        .minioObjectKey(objectKey)
                        .createdBy(actor)
                        .updatedBy(actor)
                        .build());

        storageService.put(objectKey, request.content(), request.resolvedContentType());
        projectFileRepository.save(file);

        // Index vector embedding in Qdrant Vector DB for RAG retrieval
        codeVectorService.indexFile(projectId, normalPath, request.content());

        log.info("Saved file {} in project {}", normalPath, projectId);
        return new FileContentResponse(normalPath, request.content());
    }

    @Override
    public void deleteFile(Long projectId, String path, Long userId) {
        assertAccess(projectId, userId);
        String normalPath = normalizePath(path);

        ProjectFile file = projectFileRepository
                .findByProjectIdAndPath(projectId, normalPath)
                .orElseThrow(() -> new ResourceNotFoundException("File", normalPath));

        storageService.delete(file.getMinioObjectKey());
        projectFileRepository.delete(file);

        // Remove vector embedding from Qdrant Vector DB
        codeVectorService.removeFileIndex(projectId, normalPath);

        log.info("Deleted file {} from project {}", normalPath, projectId);
    }

    // ── DOWNLOAD ──────────────────────────────────────────────────────────────

    @Override
    public void writeProjectZip(Long projectId, Long userId, OutputStream outputStream) {
        assertAccess(projectId, userId);
        List<ProjectFile> files = projectFileRepository.findByProjectId(projectId);

        try (ZipOutputStream zos = new ZipOutputStream(outputStream)) {
            for (ProjectFile file : files) {
                ZipEntry entry = new ZipEntry(file.getPath());
                zos.putNextEntry(entry);

                try (InputStream content = storageService.getStream(file.getMinioObjectKey())) {
                    content.transferTo(zos);
                } catch (Exception e) {
                    log.warn("Skipping file {} due to read error: {}", file.getPath(), e.getMessage());
                }

                zos.closeEntry();
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to create project ZIP for project " + projectId, e);
        }
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    /**
     * Verify the user is a member of the project (any role grants read access).
     */
    private void assertAccess(Long projectId, Long userId) {
        boolean isMember = projectMemberRepository.existsByIdProjectIdAndIdUserId(projectId, userId);
        if (!isMember) {
            throw new ResourceNotFoundException("Project", projectId.toString());
        }
    }

    private Project getAccessibleProject(Long projectId, Long userId) {
        assertAccess(projectId, userId);
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }

    /** Remove leading slash that Spring adds for wildcard path captures. */
    private static String normalizePath(String path) {
        return (path != null && path.startsWith("/")) ? path.substring(1) : path;
    }

    /** Build an object key unique to the project+path combination. */
    private static String buildObjectKey(Long projectId, String path) {
        return "projects/" + projectId + "/" + path;
    }
}
