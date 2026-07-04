package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.member.InviteMemberRequest;
import com.Subodh26oct.projects.lovable_clone.dto.member.MemberResponse;

public interface ProjectMemberService {
    static MemberResponse inviteMember(Long projectId, InviteMemberRequest request, Long userId) {
        return null;
    }

    ProjectMemberService getProjectMembers(Long projectId, Long userId);

    ProjectMemberService updateMemberRole(Long projectId, Long memberId, InviteMemberRequest request, Long userId);

    ProjectMemberService deleteMemberRole(Long projectId, Long memberId, Long userId);

    MemberResponse deleteProjectMember(Long projectId, Long memberId, Long userId);
}
