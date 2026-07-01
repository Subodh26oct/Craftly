package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectRequest;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectSummaryResponse;

import java.util.List;

public interface ProjectService {

    List<ProjectSummaryResponse> getUserProjects(Long userId);

    ProjectResponse getUserProjectsById(Long id, Long userId);

    ProjectService createProject(ProjectRequest request, Long userId);

    ProjectService updateProject(Long id, ProjectRequest request, Long userId);

    void softDelete(Long id, Long userId);
}
