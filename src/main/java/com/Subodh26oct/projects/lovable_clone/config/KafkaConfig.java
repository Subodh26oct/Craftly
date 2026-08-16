package com.Subodh26oct.projects.lovable_clone.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TOPIC_AI_EVENTS = "craftly.ai.events";
    public static final String TOPIC_USAGE_AUDIT = "craftly.usage.audit";
    public static final String TOPIC_PREVIEW_LOGS = "craftly.preview.logs";

    @Bean
    public NewTopic aiEventsTopic() {
        return TopicBuilder.name(TOPIC_AI_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic usageAuditTopic() {
        return TopicBuilder.name(TOPIC_USAGE_AUDIT)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic previewLogsTopic() {
        return TopicBuilder.name(TOPIC_PREVIEW_LOGS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
