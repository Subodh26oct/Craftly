package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.Preview;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.enums.PreviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreviewRepository extends JpaRepository<Preview, Long> {
    List<Preview> findByProject(Project project);
    List<Preview> findByProjectId(Long projectId);
    
    @Query("SELECT COUNT(p) FROM Preview p WHERE p.project.owner.id = :userId AND p.status = :status")
    Integer countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") PreviewStatus status);
}
