package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.preview.PreviewResponse;
import com.Subodh26oct.projects.lovable_clone.entity.Preview;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.entity.UsageLog;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.enums.PreviewStatus;
import com.Subodh26oct.projects.lovable_clone.error.ResourceNotFoundException;

import com.Subodh26oct.projects.lovable_clone.mapper.PreviewMapper;
import com.Subodh26oct.projects.lovable_clone.repository.PreviewRepository;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectMemberRepository;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UsageLogRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import com.Subodh26oct.projects.lovable_clone.service.PreviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class PreviewServiceImpl implements PreviewService {

    PreviewRepository previewRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    UserRepository userRepository;
    UsageLogRepository usageLogRepository;
    PreviewMapper previewMapper;

    @Override
    public PreviewResponse startPreview(Long projectId, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        User user = userRepository.getReferenceById(userId);

        String randomHex = UUID.randomUUID().toString().substring(0, 8);
        String namespace = "preview-proj-" + projectId + "-" + randomHex;
        String podName = "pod-craftly-app-" + projectId;
        String previewUrl = "http://localhost:5173/preview/" + projectId;

        Preview preview = Preview.builder()
                .project(project)
                .namespace(namespace)
                .podName(podName)
                .previewUrl(previewUrl)
                .status(PreviewStatus.RUNNING)
                .startedAt(Instant.now())
                .build();

        preview = previewRepository.save(preview);

        // Record usage log
        UsageLog logRecord = UsageLog.builder()
                .user(user)
                .project(project)
                .action("PREVIEW_STARTED")
                .tokensUsed(0)
                .build();
        usageLogRepository.save(logRecord);

        log.info("Started preview container {} for project {}", preview.getId(), projectId);
        return previewMapper.toPreviewResponse(preview);
    }

    @Override
    @Transactional(readOnly = true)
    public PreviewResponse getPreviewStatus(Long projectId, Long previewId, Long userId) {
        assertAccess(projectId, userId);

        Preview preview = previewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview", previewId.toString()));

        if (!preview.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Preview", previewId.toString());
        }

        return previewMapper.toPreviewResponse(preview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreviewResponse> getProjectPreviews(Long projectId, Long userId) {
        assertAccess(projectId, userId);
        List<Preview> previews = previewRepository.findByProjectId(projectId);
        return previewMapper.toListOfPreviewResponse(previews);
    }

    @Override
    public PreviewResponse stopPreview(Long projectId, Long previewId, Long userId) {
        assertAccess(projectId, userId);
        User user = userRepository.getReferenceById(userId);

        Preview preview = previewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview", previewId.toString()));

        if (!preview.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Preview", previewId.toString());
        }

        preview.setStatus(PreviewStatus.TERMINATED);
        preview.setTerminatedAt(Instant.now());
        preview = previewRepository.save(preview);

        // Record usage log
        UsageLog logRecord = UsageLog.builder()
                .user(user)
                .project(preview.getProject())
                .action("PREVIEW_STOPPED")
                .tokensUsed(0)
                .build();
        usageLogRepository.save(logRecord);

        log.info("Terminated preview container {} for project {}", previewId, projectId);
        return previewMapper.toPreviewResponse(preview);
    }

    @Override
    public SseEmitter streamPreviewLogs(Long projectId, Long previewId, Long userId) {
        assertAccess(projectId, userId);

        Preview preview = previewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview", previewId.toString()));

        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout

        CompletableFuture.runAsync(() -> {
            try {
                String[] sampleLogs = {
                        "[Pod: " + preview.getPodName() + "] Initializing Node.js container environment...",
                        "[Pod: " + preview.getPodName() + "] Mounting MinIO workspace volume for project " + projectId + "...",
                        "[Pod: " + preview.getPodName() + "] Running 'npm install' - 14 packages resolved.",
                        "[Vite v5.4.0] Local dev server ready in 214ms.",
                        "[Vite]  > Local:   " + preview.getPreviewUrl(),
                        "[Vite]  > Network: http://172.18.0.4:5173/",
                        "[Vite]  ready in 280ms.",
                        "[HMR] Connected to preview websocket stream.",
                        "[Vite] 12 modules transformed in 189ms."
                };

                for (String logLine : sampleLogs) {
                    emitter.send(SseEmitter.event()
                            .name("log")
                            .data(logLine));
                    Thread.sleep(600); // 600ms delay between log lines
                }

                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data("LOG_STREAM_COMPLETE"));
                emitter.complete();

            } catch (Exception e) {
                log.error("Error streaming preview logs for preview {}", previewId, e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(e.getMessage()));
                    emitter.completeWithError(e);
                } catch (Exception ignored) {}
            }
        });

        return emitter;
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private Project getAccessibleProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
        assertAccess(projectId, userId);
        return project;
    }

    private void assertAccess(Long projectId, Long userId) {
        boolean isOwner = projectRepository.existsByIdAndOwnerId(projectId, userId);
        boolean isMember = projectMemberRepository.existsByIdProjectIdAndIdUserId(projectId, userId);
        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException("Project", projectId.toString());
        }
    }
}
