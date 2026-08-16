package com.Subodh26oct.projects.lovable_clone.aspect;

import com.Subodh26oct.projects.lovable_clone.annotation.RequireQuota;
import com.Subodh26oct.projects.lovable_clone.enums.QuotaType;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.UsageTrackingService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class QuotaEnforcementAspect {

    UsageTrackingService usageTrackingService;
    AuthUtil authUtil;

    @Before("@annotation(requireQuota)")
    public void enforceQuota(JoinPoint joinPoint, RequireQuota requireQuota) {
        Long userId = authUtil.getCurrentUserId();
        QuotaType quotaType = requireQuota.value();

        log.debug("Enforcing quota check: type={}, userId={}, method={}", 
                quotaType, userId, joinPoint.getSignature().toShortString());

        switch (quotaType) {
            case AI_TOKENS:
                usageTrackingService.checkRateLimit(userId, 500); // 500 estimated tokens threshold check
                break;
            case MAX_PROJECTS:
                usageTrackingService.checkProjectCreationLimit(userId);
                break;
            case PREVIEW_CONTAINERS:
                usageTrackingService.checkPreviewLimit(userId);
                break;
            default:
                log.warn("Unknown quota type encountered in AOP aspect: {}", quotaType);
        }
    }
}
