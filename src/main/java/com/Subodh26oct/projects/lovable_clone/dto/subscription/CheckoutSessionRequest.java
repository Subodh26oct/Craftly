package com.Subodh26oct.projects.lovable_clone.dto.subscription;

import jakarta.validation.constraints.NotNull;

public record CheckoutSessionRequest(
        @NotNull(message = "planId is required")
        Long planId
) {}
