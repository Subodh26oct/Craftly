package com.Subodh26oct.projects.lovable_clone.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
@Getter
@Setter 
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class User {
     Long id;
     String firstName;
     String lastName;
     String email;
     String password;
     String avatarUrl;

     Instant createdAt;
     Instant updatedAt;
     Instant deletedAt;


}
