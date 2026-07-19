package com.Subodh26oct.projects.lovable_clone.controller;

import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageRequest;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageResponse;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatSessionRequest;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatSessionResponse;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.ChatSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/chat/sessions")
public class ChatSessionController {

    private final ChatSessionService chatSessionService;
    private final AuthUtil authUtil;

    /** POST /api/projects/{projectId}/chat/sessions → create a new chat session */
    @PostMapping
    public ResponseEntity<ChatSessionResponse> createSession(
            @PathVariable Long projectId,
            @Valid @RequestBody ChatSessionRequest request
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatSessionService.createSession(projectId, request, userId));
    }

    /** GET /api/projects/{projectId}/chat/sessions → list all sessions in project */
    @GetMapping
    public ResponseEntity<List<ChatSessionResponse>> getProjectSessions(
            @PathVariable Long projectId
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatSessionService.getProjectSessions(projectId, userId));
    }

    /** GET /api/projects/{projectId}/chat/sessions/{sessionId}/messages → get messages history */
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getSessionMessages(
            @PathVariable Long projectId,
            @PathVariable Long sessionId
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatSessionService.getSessionMessages(projectId, sessionId, userId));
    }

    /** POST /api/projects/{projectId}/chat/sessions/{sessionId}/messages → submit a new prompt to AI */
    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long projectId,
            @PathVariable Long sessionId,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatSessionService.sendMessage(projectId, sessionId, request, userId));
    }
}
