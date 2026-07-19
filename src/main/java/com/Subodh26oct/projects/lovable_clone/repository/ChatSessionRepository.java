package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.ChatSession;
import com.Subodh26oct.projects.lovable_clone.entity.Project;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByProjectAndDeletedAtIsNull(Project project);
    List<ChatSession> findByUserAndDeletedAtIsNull(User user);
    List<ChatSession> findByProjectIdAndDeletedAtIsNull(Long projectId);
}
