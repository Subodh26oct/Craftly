package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.config.KafkaConfig;
import com.Subodh26oct.projects.lovable_clone.dto.event.AIGenerationEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.PreviewLogEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.UsageAuditEvent;

import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumerServiceImpl {

    @KafkaListener(topics = KafkaConfig.TOPIC_AI_EVENTS, groupId = "craftly-backend-group")
    public void consumeAIGenerationEvent(AIGenerationEvent event) {
        log.info("Received AI Generation Event from Kafka: projectId={}, userId={}, tokens={}",
                event.projectId(), event.userId(), event.tokensUsed());
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_USAGE_AUDIT, groupId = "craftly-backend-group")
    public void consumeUsageAuditEvent(UsageAuditEvent event) {
        log.info("Received Usage Audit Event from Kafka: userId={}, action={}, metadata={}",
                event.userId(), event.action(), event.metadata());
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_PREVIEW_LOGS, groupId = "craftly-backend-group")
    public void consumePreviewLogEvent(PreviewLogEvent event) {
        log.info("Received Preview Log Event from Kafka: previewId={}, message={}",
                event.previewId(), event.logMessage());
    }
}
