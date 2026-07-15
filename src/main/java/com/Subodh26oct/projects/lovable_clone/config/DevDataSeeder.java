package com.Subodh26oct.projects.lovable_clone.config;

import com.Subodh26oct.projects.lovable_clone.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DevDataSeeder implements ApplicationRunner {

    UserRepository userRepository;
    EntityManager entityManager;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsById(1L)) {
            return;
        }

        String encodedPassword = passwordEncoder.encode("password");

        entityManager.createNativeQuery("""
                INSERT INTO users (id, first_name, last_name, email, password, created_at, updated_at)
                VALUES (1, 'Dev', 'User', 'dev@craftly.local', :password, NOW(), NOW())
                """)
                .setParameter("password", encodedPassword)
                .executeUpdate();

        entityManager.createNativeQuery(
                "SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))"
        ).getSingleResult();

        log.info("Seeded default dev user with id=1");
    }
}
