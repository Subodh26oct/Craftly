package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.auth.SignupRequest;
import com.Subodh26oct.projects.lovable_clone.dto.auth.UserProfileResponse;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "firstName", source = "name")
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    User toEntity(SignupRequest signupRequest);

    @Mapping(target = "name", expression = "java(formatFullName(user))")
    UserProfileResponse toUserProfileResponse(User user);

    default String formatFullName(User user) {
        if (user == null) {
            return null;
        }

        String firstName = user.getFirstName() != null ? user.getFirstName() : "";
        String lastName = user.getLastName() != null ? user.getLastName() : "";
        return (firstName + " " + lastName).trim();
    }
}
