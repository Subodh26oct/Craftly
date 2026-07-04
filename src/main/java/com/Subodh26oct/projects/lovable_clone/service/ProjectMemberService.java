package com.Subodh26oct.projects.lovable_clone.service;

import com.Subodh26oct.projects.lovable_clone.dto.member.InviteMemberRequest;
import com.Subodh26oct.projects.lovable_clone.dto.member.MemberResponse;
import com.Subodh26oct.projects.lovable_clone.dto.member.UpdateMemberRoleRequest;

import java.util.List;

public interface ProjectMemberService {
    List<MemberResponse> getProjectMembers(Long projectId, Long userId);

    static MemberResponse inviteMember(Long projectId, InviteMemberRequest request, Long userId) {
        return null;
    }

    MemberResponse updateMemberRole(Long projectId, Long memberId, UpdateMemberRoleRequest request, Long userId);

    MemberResponse deleteProjectMember(Long projectId, Long memberId, Long userId);
}
