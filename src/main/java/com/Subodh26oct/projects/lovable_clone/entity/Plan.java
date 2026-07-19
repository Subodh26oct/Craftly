package com.Subodh26oct.projects.lovable_clone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "plans")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Column(name = "stripe_price_id")
    String stripePriceId;

    @Column(name = "max_projects")
    Integer maxProjects;

    @Column(name = "max_tokens_per_day")
    Integer maxTokensPerDay;

    @Column(name = "max_previews")
    Integer maxPreviews;

    @Column(name = "unlimited_ai")
    Boolean unlimitedAi;

    @Column(columnDefinition = "text")
    String features;

    @Builder.Default
    Boolean active = true;
}
