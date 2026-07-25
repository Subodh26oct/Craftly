package com.Subodh26oct.projects.lovable_clone.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class StripeConfig {

    @Value("${stripe.api-key:}")
    private String apiKey;

    @PostConstruct
    public void initStripe() {
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("placeholder")) {
            Stripe.apiKey = apiKey.trim();
            log.info("Stripe SDK initialized successfully.");
        } else {
            log.warn("Stripe API key is not configured. Running in offline/mock billing mode.");
        }
    }
}
