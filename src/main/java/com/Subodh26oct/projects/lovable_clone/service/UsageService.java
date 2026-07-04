package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.PlanLimitsResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.UsageTodayResponse;

public interface UsageService {
    PlanLimitsResponse getCurrentSubscriptionLimitsOfUser(Long userId);

    UsageTodayResponse getTodayUsageOfUser(Long userId);
}
