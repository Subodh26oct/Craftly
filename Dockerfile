# ─────────────────────────────────────────────
# Stage 1: Build the JAR with Maven
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

# Copy Maven wrapper and pom first (cache deps layer)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests -q

# ─────────────────────────────────────────────
# Stage 2: Lightweight runtime image
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -S craftly && adduser -S craftly -G craftly

# Copy the fat JAR from build stage
COPY --from=builder /workspace/target/lovable-clone-0.0.1-SNAPSHOT.jar app.jar

# Change ownership
RUN chown craftly:craftly app.jar

USER craftly

# Expose API port
EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
