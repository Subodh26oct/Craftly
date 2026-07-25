package com.Subodh26oct.projects.lovable_clone.controller;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.CheckoutSessionRequest;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.CheckoutSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.PortalSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.SubscriptionResponse;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.StripeService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SubscriptionController {

    StripeService stripeService;
    AuthUtil authUtil;

    @PostMapping("/checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(
            @Valid @RequestBody CheckoutSessionRequest request
    ) {
        Long userId = authUtil.getCurrentUserId();
        CheckoutSessionResponse response = stripeService.createCheckoutSession(userId, request.planId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/portal-session")
    public ResponseEntity<PortalSessionResponse> createCustomerPortalSession() {
        Long userId = authUtil.getCurrentUserId();
        PortalSessionResponse response = stripeService.createCustomerPortalSession(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<SubscriptionResponse> getCurrentUserSubscription() {
        Long userId = authUtil.getCurrentUserId();
        SubscriptionResponse response = stripeService.getCurrentUserSubscription(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader
    ) {
        stripeService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok("Received");
    }
}
