package com.Subodh26oct.projects.lovable_clone.repository;

import com.Subodh26oct.projects.lovable_clone.entity.UsageLog;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    List<UsageLog> findByUser(User user);
    
    @Query("SELECT COALESCE(SUM(u.tokensUsed), 0) FROM UsageLog u WHERE u.user.id = :userId AND u.createdAt >= :since")
    Integer sumTokensUsedByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("since") Instant since);
}
