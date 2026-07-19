package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.chat.*;
import com.Subodh26oct.projects.lovable_clone.entity.*;
import com.Subodh26oct.projects.lovable_clone.enums.MessageRole;
import com.Subodh26oct.projects.lovable_clone.error.ResourceNotFoundException;
import com.Subodh26oct.projects.lovable_clone.mapper.ChatMapper;
import com.Subodh26oct.projects.lovable_clone.repository.*;
import com.Subodh26oct.projects.lovable_clone.service.AIService;
import com.Subodh26oct.projects.lovable_clone.service.ChatSessionService;
import com.Subodh26oct.projects.lovable_clone.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class ChatSessionServiceImpl implements ChatSessionService {

    ChatSessionRepository chatSessionRepository;
    ChatMessageRepository chatMessageRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    ProjectFileRepository projectFileRepository;
    UserRepository userRepository;
    UsageLogRepository usageLogRepository;
    
    StorageService storageService;
    AIService aiService;
    ChatMapper chatMapper;
    ObjectMapper objectMapper;

    @Override
    public ChatSessionResponse createSession(Long projectId, ChatSessionRequest request, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        User actor = userRepository.getReferenceById(userId);

        ChatSession session = ChatSession.builder()
                .project(project)
                .user(actor)
                .title(request.title())
                .build();

        session = chatSessionRepository.save(session);
        log.info("Created chat session {} for project {}", session.getId(), projectId);
        return chatMapper.toChatSessionResponse(session);
    }

    @Override
    public List<ChatSessionResponse> getProjectSessions(Long projectId, Long userId) {
        assertAccess(projectId, userId);
        List<ChatSession> sessions = chatSessionRepository.findByProjectIdAndDeletedAtIsNull(projectId);
        return chatMapper.toListOfChatSessionResponse(sessions);
    }

    @Override
    public List<ChatMessageResponse> getSessionMessages(Long projectId, Long sessionId, Long userId) {
        assertAccess(projectId, userId);
        ChatSession session = getSessionInProject(projectId, sessionId);
        List<ChatMessage> messages = chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);
        return chatMapper.toListOfChatMessageResponse(messages);
    }

    @Override
    public ChatMessageResponse sendMessage(Long projectId, Long sessionId, ChatMessageRequest request, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        ChatSession session = getSessionInProject(projectId, sessionId);
        User actor = userRepository.getReferenceById(userId);

        // 1. Save USER message
        ChatMessage userMessage = ChatMessage.builder()
                .chatSession(session)
                .content(request.content())
                .role(MessageRole.USER)
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Fetch rolling history of last 10 messages for context
        List<ChatMessage> dbHistory = chatMessageRepository.findByChatSessionOrderByCreatedAtAsc(session);
        List<ChatMessage> lastTen = dbHistory.size() > 10 
                ? dbHistory.subList(dbHistory.size() - 10, dbHistory.size()) 
                : dbHistory;
        List<ChatMessageResponse> historyResponses = chatMapper.toListOfChatMessageResponse(lastTen);

        // 3. Call AI Code Generation Service
        AIResponse aiResponse = aiService.generateCode(session, request.content(), historyResponses);

        // 4. Apply file changes (MinIO + DB records)
        applyFileOperations(project, actor, aiResponse.fileOperations());

        // 5. Serialize tool_calls for storage
        String toolCallsJson;
        try {
            toolCallsJson = objectMapper.writeValueAsString(aiResponse.fileOperations());
        } catch (Exception e) {
            log.warn("Failed to serialize file operations: {}", e.getMessage());
            toolCallsJson = "[]";
        }

        // 6. Save ASSISTANT message
        int mockTokens = 150 + (request.content().length() * 3); // rough estimate
        ChatMessage assistantMessage = ChatMessage.builder()
                .chatSession(session)
                .content(aiResponse.explanation())
                .role(MessageRole.ASSISTANT)
                .toolCalls(toolCallsJson)
                .tokensUsed(mockTokens)
                .build();
        chatMessageRepository.save(assistantMessage);

        // 7. Save Usage log
        UsageLog logRecord = UsageLog.builder()
                .user(actor)
                .project(project)
                .action("AI_CODE_GENERATION")
                .tokensUsed(mockTokens)
                .createdAt(Instant.now())
                .metaData(String.format("{\"prompt_length\":%d,\"files_affected\":%d}", 
                        request.content().length(), aiResponse.fileOperations().size()))
                .build();
        usageLogRepository.save(logRecord);

        log.info("Processed AI generation prompt for session {} (affecting {} files)", 
                sessionId, aiResponse.fileOperations().size());

        return chatMapper.toChatMessageResponse(assistantMessage);
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private void applyFileOperations(Project project, User actor, List<AIResponse.FileOperation> operations) {
        if (operations == null || operations.isEmpty()) {
            return;
        }

        for (AIResponse.FileOperation op : operations) {
            String path = normalizePath(op.path());
            String objectKey = "projects/" + project.getId() + "/" + path;

            if ("DELETE".equalsIgnoreCase(op.type())) {
                projectFileRepository.findByProjectIdAndPath(project.getId(), path).ifPresent(file -> {
                    try {
                        storageService.delete(file.getMinioObjectKey());
                    } catch (Exception e) {
                        log.warn("MinIO file deletion skipped/failed for key: {}", file.getMinioObjectKey());
                    }
                    projectFileRepository.delete(file);
                });
            } else {
                // CREATE_OR_UPDATE
                storageService.put(objectKey, op.content(), "text/plain");

                ProjectFile file = projectFileRepository.findByProjectIdAndPath(project.getId(), path)
                        .map(existing -> {
                            existing.setUpdatedBy(actor);
                            return existing;
                        })
                        .orElseGet(() -> ProjectFile.builder()
                                .project(project)
                                .path(path)
                                .minioObjectKey(objectKey)
                                .createdBy(actor)
                                .updatedBy(actor)
                                .build());

                projectFileRepository.save(file);
            }
        }
    }

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

    private ChatSession getSessionInProject(Long projectId, Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId.toString()));
        if (!session.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("ChatSession", sessionId.toString());
        }
        return session;
    }

    private static String normalizePath(String path) {
        return (path != null && path.startsWith("/")) ? path.substring(1) : path;
    }
}
