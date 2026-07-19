package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageResponse;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatSessionResponse;
import com.Subodh26oct.projects.lovable_clone.entity.ChatMessage;
import com.Subodh26oct.projects.lovable_clone.entity.ChatSession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChatMapper {

    public ChatSessionResponse toChatSessionResponse(ChatSession session) {
        if (session == null) {
            return null;
        }
        return new ChatSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }

    public ChatMessageResponse toChatMessageResponse(ChatMessage message) {
        if (message == null) {
            return null;
        }
        return new ChatMessageResponse(
                message.getId(),
                message.getContent(),
                message.getRole(),
                message.getToolCalls(),
                message.getCreatedAt()
        );
    }

    public List<ChatSessionResponse> toListOfChatSessionResponse(List<ChatSession> sessions) {
        if (sessions == null) {
            return null;
        }
        return sessions.stream()
                .map(this::toChatSessionResponse)
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> toListOfChatMessageResponse(List<ChatMessage> messages) {
        if (messages == null) {
            return null;
        }
        return messages.stream()
                .map(this::toChatMessageResponse)
                .collect(Collectors.toList());
    }
}
