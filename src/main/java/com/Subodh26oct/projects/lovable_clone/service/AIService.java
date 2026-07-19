package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.chat.AIResponse;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageResponse;
import com.Subodh26oct.projects.lovable_clone.entity.ChatSession;

import java.util.List;

public interface AIService {

    /**
     * Call the LLM (Gemini) with current chat context and project files context.
     * Generates both a chat explanation and automated file edits.
     *
     * @param session the current chat session
     * @param prompt the user's latest prompt message
     * @param history rolling history of the session (usually last 10 messages)
     * @return the structured AIResponse containing file changes and text summary
     */
    AIResponse generateCode(ChatSession session, String prompt, List<ChatMessageResponse> history);
}
