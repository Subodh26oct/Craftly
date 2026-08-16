package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.config.KafkaConfig;
import com.Subodh26oct.projects.lovable_clone.dto.event.AIGenerationEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.PreviewLogEvent;
import com.Subodh26oct.projects.lovable_clone.dto.event.UsageAuditEvent;
import com.Subodh26oct.projects.lovable_clone.service.KafkaProducerService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaProducerServiceImpl implements KafkaProducerService {

    @Autowired(required = false)
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void sendAIGenerationEvent(AIGenerationEvent event) {
        if (kafkaTemplate == null) return;
        try {
            String key = event.projectId() != null ? event.projectId().toString() : "global";
            kafkaTemplate.send(KafkaConfig.TOPIC_AI_EVENTS, key, event);
            log.debug("Published AIGenerationEvent to Kafka topic {}: projectId={}", KafkaConfig.TOPIC_AI_EVENTS, event.projectId());
        } catch (Exception e) {
            log.warn("Failed to publish AIGenerationEvent to Kafka (Kafka offline?): {}", e.getMessage());
        }
    }

    @Override
    public void sendUsageAuditEvent(UsageAuditEvent event) {
        if (kafkaTemplate == null) return;
        try {
            String key = event.userId() != null ? event.userId().toString() : "anonymous";
            kafkaTemplate.send(KafkaConfig.TOPIC_USAGE_AUDIT, key, event);
            log.debug("Published UsageAuditEvent to Kafka topic {}: userId={}, action={}", KafkaConfig.TOPIC_USAGE_AUDIT, event.userId(), event.action());
        } catch (Exception e) {
            log.warn("Failed to publish UsageAuditEvent to Kafka (Kafka offline?): {}", e.getMessage());
        }
    }

    @Override
    public void sendPreviewLogEvent(PreviewLogEvent event) {
        if (kafkaTemplate == null) return;
        try {
            String key = event.previewId() != null ? event.previewId().toString() : "global";
            kafkaTemplate.send(KafkaConfig.TOPIC_PREVIEW_LOGS, key, event);
            log.debug("Published PreviewLogEvent to Kafka topic {}: previewId={}", KafkaConfig.TOPIC_PREVIEW_LOGS, event.previewId());
        } catch (Exception e) {
            log.warn("Failed to publish PreviewLogEvent to Kafka (Kafka offline?): {}", e.getMessage());
        }
    }
}
