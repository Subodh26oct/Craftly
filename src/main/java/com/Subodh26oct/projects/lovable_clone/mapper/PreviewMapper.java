package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.preview.PreviewResponse;
import com.Subodh26oct.projects.lovable_clone.entity.Preview;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PreviewMapper {

    public PreviewResponse toPreviewResponse(Preview preview) {
        if (preview == null) {
            return null;
        }
        return new PreviewResponse(
                preview.getId(),
                preview.getProject() != null ? preview.getProject().getId() : null,
                preview.getNamespace(),
                preview.getPodName(),
                preview.getPreviewUrl(),
                preview.getStatus(),
                preview.getStartedAt(),
                preview.getTerminatedAt(),
                preview.getCreatedAt()
        );
    }

    public List<PreviewResponse> toListOfPreviewResponse(List<Preview> previews) {
        if (previews == null) {
            return null;
        }
        return previews.stream()
                .map(this::toPreviewResponse)
                .collect(Collectors.toList());
    }
}
