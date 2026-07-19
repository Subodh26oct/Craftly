package com.Subodh26oct.projects.lovable_clone.entity;

import com.Subodh26oct.projects.lovable_clone.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "subscriptions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    Plan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SubscriptionStatus status;

    @Column(name = "stripe_customer_id")
    String stripeCustomerId;

    @Column(name = "stripe_subscription_id", unique = true)
    String stripeSubscriptionId;

    @Column(name = "current_period_start")
    Instant currentPeriodStart;

    @Column(name = "current_period_end")
    Instant currentPeriodEnd;

    @Builder.Default
    @Column(name = "cancel_at_period_end")
    Boolean cancelAtPeriodEnd = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;
}
