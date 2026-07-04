package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.subscription.PlanResponse;

import java.util.List;

public interface PlanService {
    List<PlanResponse> getAllActivePlans();
}
