package com.Subodh26oct.projects.lovable_clone.dto.member;

import com.Subodh26oct.projects.lovable_clone.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(
       @NotNull ProjectRole role
) {
}
