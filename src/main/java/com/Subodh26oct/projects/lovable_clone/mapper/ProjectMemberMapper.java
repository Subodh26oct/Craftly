package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.member.MemberResponse;
import com.Subodh26oct.projects.lovable_clone.entity.ProjectMember;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProjectMemberMapper {

    @Mapping(target = "userId", source = "id")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "name", expression = "java(owner.getFirstName() + \" \" + owner.getLastName())")
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    @Mapping(target = "role", constant = "OWNER")
    @Mapping(target = "invitedAt", ignore = true)
    MemberResponse toProjectMemberResponseFromOwner(User owner);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "name", expression = "java(projectMember.getUser().getFirstName() + \" \" + projectMember.getUser().getLastName())")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "role", source = "projectRole")
    @Mapping(target = "invitedAt", source = "invitedAt")
    MemberResponse toProjectMemberResponseFromMember(ProjectMember projectMember);
}
