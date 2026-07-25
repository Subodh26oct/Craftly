package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.CheckoutSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.PortalSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.SubscriptionResponse;

public interface StripeService {
    CheckoutSessionResponse createCheckoutSession(Long userId, Long planId);
    PortalSessionResponse createCustomerPortalSession(Long userId);
    void handleWebhookEvent(String payload, String sigHeader);
    SubscriptionResponse getCurrentUserSubscription(Long userId);
}
