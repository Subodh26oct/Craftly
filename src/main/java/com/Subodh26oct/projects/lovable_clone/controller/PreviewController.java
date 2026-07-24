package com.Subodh26oct.projects.lovable_clone.controller;

import com.Subodh26oct.projects.lovable_clone.dto.preview.PreviewResponse;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.PreviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/previews")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PreviewController {

    PreviewService previewService;
    AuthUtil authUtil;

    @PostMapping
    public ResponseEntity<PreviewResponse> startPreview(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        PreviewResponse response = previewService.startPreview(projectId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PreviewResponse>> getProjectPreviews(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        List<PreviewResponse> previews = previewService.getProjectPreviews(projectId, userId);
        return ResponseEntity.ok(previews);
    }

    @GetMapping("/{previewId}")
    public ResponseEntity<PreviewResponse> getPreviewStatus(
            @PathVariable Long projectId,
            @PathVariable Long previewId
    ) {
        Long userId = authUtil.getCurrentUserId();
        PreviewResponse response = previewService.getPreviewStatus(projectId, previewId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{previewId}/stop")
    public ResponseEntity<PreviewResponse> stopPreview(
            @PathVariable Long projectId,
            @PathVariable Long previewId
    ) {
        Long userId = authUtil.getCurrentUserId();
        PreviewResponse response = previewService.stopPreview(projectId, previewId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/{previewId}/logs", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPreviewLogs(
            @PathVariable Long projectId,
            @PathVariable Long previewId
    ) {
        Long userId = authUtil.getCurrentUserId();
        return previewService.streamPreviewLogs(projectId, previewId, userId);
    }
}
