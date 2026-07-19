package com.Subodh26oct.projects.lovable_clone.entity;

import com.Subodh26oct.projects.lovable_clone.enums.PreviewStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "previews")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Preview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(nullable = false)
    String namespace;

    @Column(name = "pod_name")
    String podName;

    @Column(name = "preview_url")
    String previewUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PreviewStatus status;

    @Column(name = "started_at")
    Instant startedAt;

    @Column(name = "terminated_at")
    Instant terminatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}
