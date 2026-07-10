package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectRequest;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectResponse;
import com.Subodh26oct.projects.lovable_clone.dto.project.ProjectSummaryResponse;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(ProjectRequest request);

    List<ProjectSummaryResponse> getUserProjects();

    ProjectResponse getUserProjectById(Long id);

    ProjectResponse updateProject(Long id, ProjectRequest request);

    void softDelete(Long id);
}
