package com.Subodh26oct.projects.lovable_clone;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class CraftlyEndToEndIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @DisplayName("1. User Signup and Login Integration Flow")
    void testUserSignupAndLoginFlow() throws Exception {
        String signupPayload = """
                {
                    "username": "e2e_user@craftly.local",
                    "name": "E2E Tester",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("e2e_user@craftly.local"));

        String loginPayload = """
                {
                    "username": "e2e_user@craftly.local",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("2. Stripe Webhook Plan Upgrade Flow")
    void testStripeWebhookPlanUpgradeFlow() throws Exception {
        String webhookPayload = """
                {
                    "id": "evt_e2e_test_101",
                    "type": "checkout.session.completed",
                    "data": {
                        "object": {
                            "client_reference_id": "1",
                            "customer": "cus_e2e_test",
                            "subscription": "sub_e2e_test",
                            "metadata": {
                                "userId": "1",
                                "planId": "2"
                            }
                        }
                    }
                }
                """;

        mockMvc.perform(post("/api/subscriptions/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("3. Health and Telemetry Actuator Endpoints")
    void testSystemHealthAndActuatorEndpoints() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
