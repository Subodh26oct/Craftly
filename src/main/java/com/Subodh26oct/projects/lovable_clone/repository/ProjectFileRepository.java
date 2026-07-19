package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    List<ProjectFile> findByProject(Project project);
    List<ProjectFile> findByProjectId(Long projectId);
    Optional<ProjectFile> findByProjectAndPath(Project project, String path);
    Optional<ProjectFile> findByProjectIdAndPath(Long projectId, String path);
    boolean existsByProjectAndPath(Project project, String path);
}
