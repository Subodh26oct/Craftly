package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.Subscription;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findFirstByUserAndStatusOrderByIdDesc(User user, SubscriptionStatus status);
    Optional<Subscription> findFirstByUserIdOrderByIdDesc(Long userId);
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
