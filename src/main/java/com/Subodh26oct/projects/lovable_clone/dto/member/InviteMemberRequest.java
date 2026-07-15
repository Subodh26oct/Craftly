package com.Subodh26oct.projects.lovable_clone.dto.member;

import com.Subodh26oct.projects.lovable_clone.enums.ProjectRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public record InviteMemberRequest(
        @Email @NotBlank String username,
        @NotNull ProjectRole role
) {
}
