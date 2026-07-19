package com.Subodh26oct.projects.lovable_clone.mapper;

import com.Subodh26oct.projects.lovable_clone.dto.auth.SignupRequest;
import com.Subodh26oct.projects.lovable_clone.dto.auth.UserProfileResponse;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(SignupRequest signupRequest) {
        if (signupRequest == null) {
            return null;
        }
        return User.builder()
                .username(signupRequest.username())
                .name(signupRequest.name())
                .password(signupRequest.password())
                .build();
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getName()
        );
    }
}
