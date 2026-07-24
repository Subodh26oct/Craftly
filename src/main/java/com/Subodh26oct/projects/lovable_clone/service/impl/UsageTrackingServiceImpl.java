package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.usage.ProjectUsageSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.dto.usage.UsageLogDto;
import com.Subodh26oct.projects.lovable_clone.dto.usage.UserUsageSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.entity.Plan;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.entity.UsageLog;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.error.RateLimitExceededException;
import com.Subodh26oct.projects.lovable_clone.error.ResourceNotFoundException;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectMemberRepository;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UsageLogRepository;
import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import com.Subodh26oct.projects.lovable_clone.service.UsageTrackingService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class UsageTrackingServiceImpl implements UsageTrackingService {

    UsageLogRepository usageLogRepository;
    UserRepository userRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    com.Subodh26oct.projects.lovable_clone.repository.SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserUsageSummaryResponse getUserUsage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Plan plan = subscriptionRepository.findFirstByUserIdOrderByIdDesc(userId)
                .map(com.Subodh26oct.projects.lovable_clone.entity.Subscription::getPlan)
                .orElse(null);
        String planName = (plan != null && plan.getName() != null) ? plan.getName() : "FREE";
        int maxTokensPerDay = (plan != null && plan.getMaxTokensPerDay() != null) ? plan.getMaxTokensPerDay() : 10_000;
        int monthlyTokenLimit = 50_000; // Free tier standard

        if ("PRO".equalsIgnoreCase(planName)) {
            monthlyTokenLimit = 500_000;
        } else if ("ENTERPRISE".equalsIgnoreCase(planName)) {
            monthlyTokenLimit = 5_000_000;
        }

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfMonth = YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        int tokensToday = usageLogRepository.sumTokensUsedByUserIdAndCreatedAtAfter(userId, startOfDay);
        int tokensThisMonth = usageLogRepository.sumTokensUsedByUserIdAndCreatedAtAfter(userId, startOfMonth);

        int remainingThisMonth = Math.max(0, monthlyTokenLimit - tokensThisMonth);
        double percentageUsed = Math.min(100.0, ((double) tokensThisMonth / monthlyTokenLimit) * 100.0);
        boolean isLimitExceeded = tokensThisMonth >= monthlyTokenLimit || tokensToday >= maxTokensPerDay;

        List<UsageLog> recentLogs = usageLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<UsageLogDto> recentActivity = recentLogs.stream()
                .limit(20)
                .map(this::toUsageLogDto)
                .toList();

        return new UserUsageSummaryResponse(
                userId,
                planName,
                tokensToday,
                maxTokensPerDay,
                tokensThisMonth,
                monthlyTokenLimit,
                remainingThisMonth,
                Math.round(percentageUsed * 100.0) / 100.0,
                isLimitExceeded,
                recentActivity
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectUsageSummaryResponse getProjectUsage(Long projectId, Long userId) {
        Project project = getAccessibleProject(projectId, userId);

        int totalTokens = usageLogRepository.sumTokensUsedByProjectId(projectId);
        long requestCount = usageLogRepository.countByProjectId(projectId);

        List<UsageLog> projectLogs = usageLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        List<UsageLogDto> recentActivity = projectLogs.stream()
                .limit(20)
                .map(this::toUsageLogDto)
                .toList();

        return new ProjectUsageSummaryResponse(
                projectId,
                project.getName(),
                totalTokens,
                requestCount,
                recentActivity
        );
    }

    @Override
    @Transactional(readOnly = true)
    public void checkRateLimit(Long userId, int estimatedTokens) {
        Plan plan = subscriptionRepository.findFirstByUserIdOrderByIdDesc(userId)
                .map(com.Subodh26oct.projects.lovable_clone.entity.Subscription::getPlan)
                .orElse(null);
        if (plan != null && Boolean.TRUE.equals(plan.getUnlimitedAi())) {
            return; // Enterprise/Unlimited bypass
        }

        String planName = (plan != null && plan.getName() != null) ? plan.getName() : "FREE";
        int maxTokensPerDay = (plan != null && plan.getMaxTokensPerDay() != null) ? plan.getMaxTokensPerDay() : 10_000;
        int monthlyTokenLimit = 50_000;

        if ("PRO".equalsIgnoreCase(planName)) {
            monthlyTokenLimit = 500_000;
        }

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfMonth = YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        int tokensToday = usageLogRepository.sumTokensUsedByUserIdAndCreatedAtAfter(userId, startOfDay);
        int tokensThisMonth = usageLogRepository.sumTokensUsedByUserIdAndCreatedAtAfter(userId, startOfMonth);

        if (tokensToday + estimatedTokens > maxTokensPerDay) {
            throw new RateLimitExceededException("Daily token limit (" + maxTokensPerDay + ") exceeded for " + planName + " tier. Upgrade your plan for higher usage.");
        }

        if (tokensThisMonth + estimatedTokens > monthlyTokenLimit) {
            throw new RateLimitExceededException("Monthly token limit (" + monthlyTokenLimit + ") exceeded for " + planName + " tier. Please upgrade subscription.");
        }
    }

    @Override
    public void recordUsage(Long userId, Long projectId, String action, int tokensUsed, int durationMs) {
        User user = userRepository.getReferenceById(userId);
        Project project = (projectId != null) ? projectRepository.getReferenceById(projectId) : null;

        UsageLog logRecord = UsageLog.builder()
                .user(user)
                .project(project)
                .action(action)
                .tokensUsed(tokensUsed)
                .durationMs(durationMs)
                .build();

        usageLogRepository.save(logRecord);
        log.debug("Recorded usage log: action={}, user={}, tokens={}", action, userId, tokensUsed);
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private UsageLogDto toUsageLogDto(UsageLog log) {
        return new UsageLogDto(
                log.getId(),
                log.getUser() != null ? log.getUser().getId() : null,
                log.getProject() != null ? log.getProject().getId() : null,
                log.getAction(),
                log.getTokensUsed(),
                log.getDurationMs(),
                log.getCreatedAt()
        );
    }

    private Project getAccessibleProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
        boolean isOwner = projectRepository.existsByIdAndOwnerId(projectId, userId);
        boolean isMember = projectMemberRepository.existsByIdProjectIdAndIdUserId(projectId, userId);
        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException("Project", projectId.toString());
        }
        return project;
    }
}
