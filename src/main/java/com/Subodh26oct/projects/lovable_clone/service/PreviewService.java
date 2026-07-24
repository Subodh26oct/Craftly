package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.preview.PreviewResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface PreviewService {
    PreviewResponse startPreview(Long projectId, Long userId);
    PreviewResponse getPreviewStatus(Long projectId, Long previewId, Long userId);
    List<PreviewResponse> getProjectPreviews(Long projectId, Long userId);
    PreviewResponse stopPreview(Long projectId, Long previewId, Long userId);
    SseEmitter streamPreviewLogs(Long projectId, Long previewId, Long userId);
}
