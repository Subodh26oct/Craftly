package com.Subodh26oct.projects.lovable_clone.dto.member;

import com.Subodh26oct.projects.lovable_clone.enums.ProjectRole;

public record UpdateMemberRoleRequest(
        ProjectRole role
) {
}
