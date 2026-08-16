package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.event.AIGenerationEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.PreviewLogEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.UsageAuditEvent;

public interface KafkaProducerService {
    void sendAIGenerationEvent(AIGenerationEvent event);
    void sendUsageAuditEvent(UsageAuditEvent event);
    void sendPreviewLogEvent(PreviewLogEvent event);
}
