package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.PlanLimitsResponse;
import com.Subodh26oct.projects.lovable_clone.dto.subscription.UsageTodayResponse;
import com.Subodh26oct.projects.lovable_clone.service.UsageService;
import org.springframework.stereotype.Service;

@Service
public class UsageServiceImpl implements UsageService {
    @Override
    public PlanLimitsResponse getCurrentSubscriptionLimitsOfUser(Long userId) {
        return null;
    }

    @Override
    public UsageTodayResponse getTodayUsageOfUser(Long userId) {
        return null;
    }
}
