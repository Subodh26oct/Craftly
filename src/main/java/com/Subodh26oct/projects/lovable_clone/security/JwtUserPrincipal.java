package com.Subodh26oct.projects.lovable_clone.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public record JwtUserPrincipal(
        Long userId,
        String email,
        List<GrantedAuthority> authorities
) {
}
