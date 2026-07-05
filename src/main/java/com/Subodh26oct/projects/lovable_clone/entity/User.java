package com.Subodh26oct.projects.lovable_clone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
@Getter
@Setter 
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@Entity
@NoArgsConstructor
@Builder
@Table(name="users")
public class User {

     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
     Long id;


     String firstName;
     String lastName;
     String email;
     String password;
     String avatarUrl;

     @CreationTimestamp
     Instant createdAt;

     @UpdateTimestamp
     Instant updatedAt;

     Instant deletedAt;


}
