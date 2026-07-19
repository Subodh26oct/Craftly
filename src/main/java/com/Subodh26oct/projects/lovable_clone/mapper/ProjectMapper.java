package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.auth.UserProfileResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectSummaryResponse;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProjectMapper {

    private final UserMapper userMapper;

    public ProjectResponse toProjectResponse(Project project) {
        if (project == null) {
            return null;
        }
        UserProfileResponse ownerResponse = userMapper.toUserProfileResponse(project.getOwner());
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                ownerResponse
        );
    }

    public ProjectSummaryResponse toProjectSummaryResponse(Project project) {
        if (project == null) {
            return null;
        }
        return new ProjectSummaryResponse(
                project.getId(),
                project.getName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public List<ProjectSummaryResponse> toListOfProjectSummaryResponse(List<Project> projects) {
        if (projects == null) {
            return null;
        }
        return projects.stream()
                .map(this::toProjectSummaryResponse)
                .collect(Collectors.toList());
    }
}
