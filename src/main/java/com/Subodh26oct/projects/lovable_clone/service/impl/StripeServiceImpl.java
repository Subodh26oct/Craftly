package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.CheckoutSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.PlanResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.PortalSessionResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.SubscriptionResponse;
import com.Subodh26oct.projects.lovable_clone.entity.Plan;
import com.Subodh26oct.projects.lovable_clone.entity.Subscription;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.enums.SubscriptionStatus;
import com.Subodh26oct.projects.lovable_clone.error.BadRequestException;
import com.Subodh26oct.projects.lovable_clone.error.ResourceNotFoundException;
import com.Subodh26oct.projects.lovable_clone.repository.PlanRepository;
import com.Subodh26oct.projects.lovable_clone.repository.SubscriptionRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UsageLogRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import com.Subodh26oct.projects.lovable_clone.service.StripeService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.billingportal.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Transactional
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api-key:}")
    String apiKey;

    @Value("${stripe.webhook-secret:}")
    String webhookSecret;

    @Value("${stripe.success-url:http://localhost:5173/dashboard?payment=success}")
    String successUrl;

    @Value("${stripe.cancel-url:http://localhost:5173/pricing?payment=cancel}")
    String cancelUrl;

    final UserRepository userRepository;
    final PlanRepository planRepository;
    final SubscriptionRepository subscriptionRepository;
    final UsageLogRepository usageLogRepository;
    final ObjectMapper objectMapper;

    @Override
    public CheckoutSessionResponse createCheckoutSession(Long userId, Long planId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", planId.toString()));

        if (isOfflineMode()) {
            log.info("Running Stripe in offline/mock mode for user {} and plan {}", userId, planId);
            String mockSessionId = "cs_test_" + UUID.randomUUID().toString().substring(0, 12);
            String mockUrl = successUrl + "&planId=" + planId + "&session_id=" + mockSessionId;
            return new CheckoutSessionResponse(mockUrl, mockSessionId);
        }

        try {
            String priceId = (plan.getStripePriceId() != null && !plan.getStripePriceId().isEmpty())
                    ? plan.getStripePriceId()
                    : "price_1MockDefaultPrice";

            com.stripe.param.checkout.SessionCreateParams params = com.stripe.param.checkout.SessionCreateParams.builder()
                    .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(user.getEmail())
                    .setClientReferenceId(user.getId().toString())
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("planId", plan.getId().toString())
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(
                            LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);
            log.info("Created Stripe Checkout Session {} for user {}", session.getId(), userId);
            return new CheckoutSessionResponse(session.getUrl(), session.getId());

        } catch (Exception e) {
            log.error("Failed to create Stripe Checkout Session for user {}", userId, e);
            throw new BadRequestException("Failed to initialize Stripe checkout: " + e.getMessage());
        }
    }

    @Override
    public PortalSessionResponse createCustomerPortalSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        if (isOfflineMode() || user.getStripeCustomerId() == null) {
            String mockPortalUrl = "http://localhost:5173/dashboard?portal=mock";
            return new PortalSessionResponse(mockPortalUrl);
        }

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setCustomer(user.getStripeCustomerId())
                    .setReturnUrl(successUrl)
                    .build();

            com.stripe.model.billingportal.Session portalSession = com.stripe.model.billingportal.Session.create(params);
            return new PortalSessionResponse(portalSession.getUrl());

        } catch (Exception e) {
            log.error("Failed to create Stripe Customer Portal Session for user {}", userId, e);
            throw new BadRequestException("Failed to open billing portal: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event = null;
        try {
            if (webhookSecret != null && !webhookSecret.trim().isEmpty() && !webhookSecret.contains("placeholder")) {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            }
        } catch (Exception e) {
            log.warn("Stripe Webhook signature verification failed: {}. Parsing raw payload.", e.getMessage());
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = (event != null) ? event.getType() : root.path("type").asText();
            JsonNode dataObject = root.path("data").path("object");

            log.info("Processing Stripe Webhook event type: {}", eventType);

            switch (eventType) {
                case "checkout.session.completed":
                    handleCheckoutSessionCompleted(dataObject);
                    break;
                case "customer.subscription.updated":
                    handleSubscriptionUpdated(dataObject);
                    break;
                case "customer.subscription.deleted":
                    handleSubscriptionDeleted(dataObject);
                    break;
                case "invoice.payment_failed":
                    handleInvoicePaymentFailed(dataObject);
                    break;
                default:
                    log.info("Unhandled Stripe webhook event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing Stripe webhook event payload", e);
            throw new BadRequestException("Webhook processing error: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getCurrentUserSubscription(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Subscription subscription = subscriptionRepository.findFirstByUserIdOrderByIdDesc(userId)
                .orElse(null);

        Plan plan = (subscription != null) ? subscription.getPlan() : null;
        if (plan == null) {
            plan = planRepository.findByName("FREE").orElse(null);
        }

        PlanResponse planResponse = (plan != null)
                ? new PlanResponse(plan.getId(), plan.getName(), plan.getMaxProjects(), plan.getMaxTokensPerDay(), plan.getUnlimitedAi(), "$0/mo")
                : new PlanResponse(0L, "FREE", 3, 10000, false, "$0/mo");

        String statusStr = (subscription != null) ? subscription.getStatus().name() : "ACTIVE";
        Instant periodEnd = (subscription != null && subscription.getCurrentPeriodEnd() != null)
                ? subscription.getCurrentPeriodEnd()
                : Instant.now().plusSeconds(30 * 86400L);

        Instant startOfMonth = YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        int tokensUsed = usageLogRepository.sumTokensUsedByUserIdAndCreatedAtAfter(userId, startOfMonth);

        return new SubscriptionResponse(planResponse, statusStr, periodEnd, (long) tokensUsed);
    }

    // ── PRIVATE WEBHOOK HANDLERS ─────────────────────────────────────────────

    private void handleCheckoutSessionCompleted(JsonNode sessionNode) {
        String userIdStr = sessionNode.path("client_reference_id").asText();
        if (userIdStr.isEmpty() || userIdStr.equals("null")) {
            userIdStr = sessionNode.path("metadata").path("userId").asText();
        }
        String planIdStr = sessionNode.path("metadata").path("planId").asText();
        String customerId = sessionNode.path("customer").asText();
        String subscriptionId = sessionNode.path("subscription").asText();

        if (!userIdStr.isEmpty() && !userIdStr.equals("null")) {
            Long userId = Long.parseLong(userIdStr);
            User user = userRepository.findById(userId).orElse(null);

            if (user != null) {
                user.setStripeCustomerId(customerId);

                Long planId = (!planIdStr.isEmpty() && !planIdStr.equals("null")) ? Long.parseLong(planIdStr) : 2L;
                Plan plan = planRepository.findById(planId).orElse(null);

                if (plan != null) {
                    Subscription subscription = subscriptionRepository
                            .findByStripeSubscriptionId(subscriptionId)
                            .map(existing -> {
                                existing.setPlan(plan);
                                existing.setStatus(SubscriptionStatus.ACTIVE);
                                existing.setCurrentPeriodStart(Instant.now());
                                existing.setCurrentPeriodEnd(Instant.now().plusSeconds(30 * 86400L));
                                return existing;
                            })
                            .orElseGet(() -> Subscription.builder()
                                    .user(user)
                                    .plan(plan)
                                    .status(SubscriptionStatus.ACTIVE)
                                    .stripeCustomerId(customerId)
                                    .stripeSubscriptionId(subscriptionId)
                                    .currentPeriodStart(Instant.now())
                                    .currentPeriodEnd(Instant.now().plusSeconds(30 * 86400L))
                                    .build());

                    subscriptionRepository.save(subscription);
                    recordSubscriptionAudit(user, "SUBSCRIPTION_UPGRADED", "Upgraded to plan: " + plan.getName());
                    log.info("Activated subscription for user {} on plan {}", userId, plan.getName());
                }
            }
        }
    }

    private void handleSubscriptionUpdated(JsonNode subNode) {
        String subId = subNode.path("id").asText();
        String statusStr = subNode.path("status").asText();

        subscriptionRepository.findByStripeSubscriptionId(subId).ifPresent(sub -> {
            if ("active".equalsIgnoreCase(statusStr)) {
                sub.setStatus(SubscriptionStatus.ACTIVE);
            } else if ("past_due".equalsIgnoreCase(statusStr)) {
                sub.setStatus(SubscriptionStatus.PAST_DUE);
            } else if ("canceled".equalsIgnoreCase(statusStr) || "cancelled".equalsIgnoreCase(statusStr)) {
                sub.setStatus(SubscriptionStatus.CANCELLED);
            }
            subscriptionRepository.save(sub);
            log.info("Updated subscription {} status to {}", subId, statusStr);
        });
    }

    private void handleSubscriptionDeleted(JsonNode subNode) {
        String subId = subNode.path("id").asText();
        subscriptionRepository.findByStripeSubscriptionId(subId).ifPresent(sub -> {
            sub.setStatus(SubscriptionStatus.CANCELLED);
            
            // Downgrade to FREE plan
            Plan freePlan = planRepository.findByName("FREE").orElse(null);
            if (freePlan != null) {
                sub.setPlan(freePlan);
            }

            subscriptionRepository.save(sub);
            recordSubscriptionAudit(sub.getUser(), "SUBSCRIPTION_CANCELLED", "Subscription cancelled, reverted to FREE tier");
            log.info("Subscription {} was cancelled for user {}", subId, sub.getUser().getId());
        });
    }

    private void handleInvoicePaymentFailed(JsonNode invoiceNode) {
        String subId = invoiceNode.path("subscription").asText();
        String customerId = invoiceNode.path("customer").asText();

        if (!subId.isEmpty() && !subId.equals("null")) {
            subscriptionRepository.findByStripeSubscriptionId(subId).ifPresent(sub -> {
                sub.setStatus(SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(sub);
                recordSubscriptionAudit(sub.getUser(), "INVOICE_PAYMENT_FAILED", "Stripe recurring invoice payment failed");
                log.warn("Payment failed for subscription {}, marked PAST_DUE", subId);
            });
        }
    }

    private void recordSubscriptionAudit(User user, String action, String metadata) {
        try {
            com.Subodh26oct.projects.lovable_clone.entity.UsageLog auditLog = com.Subodh26oct.projects.lovable_clone.entity.UsageLog.builder()
                    .user(user)
                    .action(action)
                    .tokensUsed(0)
                    .metaData(metadata)
                    .build();
            usageLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to record subscription audit log: {}", e.getMessage());
        }
    }

    private boolean isOfflineMode() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("placeholder");
    }
}
