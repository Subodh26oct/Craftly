package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageRequest;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageResponse;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatSessionRequest;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatSessionResponse;

import java.util.List;

public interface ChatSessionService {

    /** Create a new chat session for a project */
    ChatSessionResponse createSession(Long projectId, ChatSessionRequest request, Long userId);

    /** Get all non-deleted chat sessions for a project */
    List<ChatSessionResponse> getProjectSessions(Long projectId, Long userId);

    /** Get message history for a specific chat session */
    List<ChatMessageResponse> getSessionMessages(Long projectId, Long sessionId, Long userId);

    /**
     * Send a prompt message into a chat session.
     * Triggers AI code generation, writes changes to storage/DB, and logs usage.
     */
    ChatMessageResponse sendMessage(Long projectId, Long sessionId, ChatMessageRequest request, Long userId);
}
