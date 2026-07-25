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
    com.Subodh26oct.projects.lovable_clone.repository.PlanRepository planRepository;
    EntityManager entityManager;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (planRepository.count() == 0) {
            com.Subodh26oct.projects.lovable_clone.entity.Plan freePlan = com.Subodh26oct.projects.lovable_clone.entity.Plan.builder()
                    .name("FREE")
                    .maxProjects(3)
                    .maxTokensPerDay(10000)
                    .maxPreviews(1)
                    .unlimitedAi(false)
                    .stripePriceId("price_free")
                    .active(true)
                    .build();

            com.Subodh26oct.projects.lovable_clone.entity.Plan proPlan = com.Subodh26oct.projects.lovable_clone.entity.Plan.builder()
                    .name("PRO")
                    .maxProjects(20)
                    .maxTokensPerDay(500000)
                    .maxPreviews(10)
                    .unlimitedAi(false)
                    .stripePriceId("price_1ProPlanMonth")
                    .active(true)
                    .build();

            com.Subodh26oct.projects.lovable_clone.entity.Plan enterprisePlan = com.Subodh26oct.projects.lovable_clone.entity.Plan.builder()
                    .name("ENTERPRISE")
                    .maxProjects(100)
                    .maxTokensPerDay(5000000)
                    .maxPreviews(100)
                    .unlimitedAi(true)
                    .stripePriceId("price_1EnterprisePlanMonth")
                    .active(true)
                    .build();

            planRepository.saveAll(java.util.List.of(freePlan, proPlan, enterprisePlan));
            log.info("Seeded default subscription plans: FREE (id=1), PRO (id=2), ENTERPRISE (id=3)");
        }

        if (userRepository.existsById(1L)) {
            return;
        }

        String encodedPassword = passwordEncoder.encode("password");

        entityManager.createNativeQuery("""
                INSERT INTO users (id, name, email, password, created_at, updated_at, email_verified)
                VALUES (1, 'Dev User', 'dev@craftly.local', :password, NOW(), NOW(), true)
                """)
                .setParameter("password", encodedPassword)
                .executeUpdate();

        entityManager.createNativeQuery(
                "SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))"
        ).getSingleResult();

        log.info("Seeded default dev user with id=1");
    }
}
