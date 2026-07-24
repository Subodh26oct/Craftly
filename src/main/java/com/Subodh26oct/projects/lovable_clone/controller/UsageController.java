package com.Subodh26oct.projects.lovable_clone.controller;

import com.Subodh26oct.projects.lovable_clone.dto.usage.ProjectUsageSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.dto.usage.UserUsageSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.UsageTrackingService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UsageController {

    UsageTrackingService usageTrackingService;
    AuthUtil authUtil;

    @GetMapping("/usage/me")
    public ResponseEntity<UserUsageSummaryResponse> getCurrentUserUsage() {
        Long userId = authUtil.getCurrentUserId();
        UserUsageSummaryResponse usage = usageTrackingService.getUserUsage(userId);
        return ResponseEntity.ok(usage);
    }

    @GetMapping("/projects/{projectId}/usage")
    public ResponseEntity<ProjectUsageSummaryResponse> getProjectUsage(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        ProjectUsageSummaryResponse usage = usageTrackingService.getProjectUsage(projectId, userId);
        return ResponseEntity.ok(usage);
    }
}
