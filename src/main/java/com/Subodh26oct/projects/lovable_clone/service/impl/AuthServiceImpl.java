package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.auth.AuthResponse;
import com.Subodh26oct.projects.lovable_clone.dto.auth.LoginRequest;
import com.Subodh26oct.projects.lovable_clone.dto.auth.SignupRequest;
import com.Subodh26oct.projects.lovable_clone.dto.auth.UserProfileResponse;
import com.Subodh26oct.projects.lovable_clone.entity.User;
import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import com.Subodh26oct.projects.lovable_clone.security.AuthUtil;
import com.Subodh26oct.projects.lovable_clone.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUtil authUtil;

    @Override
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
                .email(request.email())
                .firstName(request.name())
                .password(passwordEncoder.encode(request.password()))
                .build();

        User saved = userRepository.save(user);
        String token = authUtil.generateAccessToken(saved);

        return new AuthResponse(token, toProfile(saved));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = authUtil.generateAccessToken(user);
        return new AuthResponse(token, toProfile(user));
    }

    private UserProfileResponse toProfile(User user) {
        String name = user.getFirstName() != null ? user.getFirstName() : "";
        if (user.getLastName() != null && !user.getLastName().isBlank()) {
            name = name + " " + user.getLastName();
        }
        return new UserProfileResponse(user.getId(), user.getEmail(), name.trim(), user.getAvatarUrl());
    }
}
