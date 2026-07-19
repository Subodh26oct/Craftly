package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.ChatMessage;
import com.Subodh26oct.projects.lovable_clone.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionOrderByCreatedAtAsc(ChatSession chatSession);
    List<ChatMessage> findByChatSessionIdOrderByCreatedAtAsc(Long chatSessionId);
}

