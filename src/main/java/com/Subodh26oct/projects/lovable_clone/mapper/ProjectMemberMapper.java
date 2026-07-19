package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.member.MemberResponse;
import com.Subodh26oct.projects.lovable_clone.entity.ProjectMember;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.enums.ProjectRole;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class ProjectMemberMapper {

    public MemberResponse toProjectMemberResponseFromOwner(User owner) {
        if (owner == null) {
            return null;
        }
        return new MemberResponse(
                owner.getId(),
                owner.getUsername(),
                owner.getName(),
                ProjectRole.OWNER,
                Instant.now()
        );
    }

    public MemberResponse toProjectMemberResponseFromMember(ProjectMember projectMember) {
        if (projectMember == null) {
            return null;
        }
        User user = projectMember.getUser();
        String uName = (user != null) ? user.getUsername() : null;
        String name = (user != null) ? user.getName() : null;
        Long uId = (user != null) ? user.getId() : null;

        return new MemberResponse(
                uId,
                uName,
                name,
                projectMember.getProjectRole(),
                projectMember.getInvitedAt()
        );
    }
}
