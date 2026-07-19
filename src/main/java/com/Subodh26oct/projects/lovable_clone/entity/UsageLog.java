package com.Subodh26oct.projects.lovable_clone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "usage_logs")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    Project project;

    @Column(nullable = false)
    String action;

    @Column(name = "tokens_used")
    Integer tokensUsed;

    @Column(name = "duration_ms")
    Integer durationMs;

    @Column(name = "metadata", columnDefinition = "text")
    String metaData;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}
