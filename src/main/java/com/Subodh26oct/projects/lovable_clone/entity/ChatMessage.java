package com.Subodh26oct.projects.lovable_clone.entity;

import com.Subodh26oct.projects.lovable_clone.enums.MessageRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "chat_messages")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    ChatSession chatSession;

    @Column(columnDefinition = "text", nullable = false)
    String content;

    @Column(name = "tool_calls", columnDefinition = "text")
    String toolCalls;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MessageRole role;

    @Column(name = "tokens_used")
    Integer tokensUsed;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}
