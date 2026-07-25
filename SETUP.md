# Craftly — AI Code Generation Platform
## Setup & Deployment Guide

---

## 🏗️ Architecture Overview

```
                        ┌──────────────────────────────────┐
                        │   Craftly Spring Boot API :8080  │
                        └──────────────┬───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
   ┌──────────▼──────────┐  ┌─────────▼─────────┐  ┌──────────▼──────────┐
   │  PostgreSQL 16       │  │  MinIO (S3)        │  │  Qdrant Vector DB   │
   │  :5432               │  │  API:9001          │  │  REST:6333          │
   └──────────────────────┘  │  Console:9091      │  │  gRPC:6334          │
                             └────────────────────┘  └─────────────────────┘
```

---

## 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker Desktop | 4.x+ | Container runtime |
| Docker Compose | v2+ | Orchestration |
| Java 21 | JDK 21 | Build only (not needed with Docker) |

---

## 🚀 Option A: One-Click Docker Compose (Recommended)

This starts all 4 services (PostgreSQL + MinIO + Qdrant + Spring Boot) with one command.

### Step 1: Configure secrets

```bash
cp .env.production .env
```

Now open .env and fill in your real values:

```dotenv
DB_PASSWORD=your_strong_db_password
JWT_SECRET_KEY=your_64_char_secret
MINIO_ACCESS_KEY=your_minio_key
MINIO_SECRET_KEY=your_minio_secret
GEMINI_API_KEY=your_gemini_api_key
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Launch the stack

```bash
docker compose up --build -d
```

### Step 3: Verify services are running

```bash
docker compose ps
```

Expected output:
```
NAME                STATUS     PORTS
craftly-postgres    running    0.0.0.0:5432->5432/tcp
craftly-minio       running    0.0.0.0:9001->9000/tcp, 0.0.0.0:9091->9091/tcp
craftly-qdrant      running    0.0.0.0:6333->6333/tcp, 0.0.0.0:6334->6334/tcp
craftly-api         running    0.0.0.0:8080->8080/tcp
```

### Step 4: Test the API

```bash
curl http://localhost:8080/api/auth/health
```

### Step 5: View live logs

```bash
docker compose logs -f craftly-api
```

---

## Stop the Stack

```bash
docker compose down          # stop (keeps data volumes)
docker compose down -v       # stop + wipe all data volumes
```

---

## 🔧 Option B: Manual Local Development

Use this if you prefer running the Spring Boot app directly in IntelliJ.

### Step 1: Start infrastructure services only

```bash
docker compose up postgres minio qdrant -d
```

### Step 2: Run the app via IntelliJ or Maven

```bash
./mvnw.cmd spring-boot:run
```

OR run the JAR directly:

```bash
java -jar target/lovable-clone-0.0.1-SNAPSHOT.jar
```

---

## 🌍 Production Hosting Guide

### Recommended Providers

| Service | Provider | Notes |
|---------|----------|-------|
| Spring Boot API | Railway / Render / DigitalOcean | Deploy JAR or Docker image |
| PostgreSQL | Railway / Neon / Supabase | Managed Postgres |
| MinIO | DigitalOcean Spaces / AWS S3 | S3-compatible object storage |
| Qdrant | Qdrant Cloud (qdrant.tech) | Managed vector DB with free tier |
| Stripe | stripe.com | No hosting needed |

### Deploying to Railway.app

1. Push your project to GitHub.
2. Create a new Railway project → Deploy from GitHub.
3. Add PostgreSQL plugin from Railway dashboard.
4. Set Environment Variables (from .env.production) in Railway's Variables tab.
5. Set RAILWAY_DOCKERFILE_PATH=Dockerfile in settings.
6. Deploy! Railway will build and run the Docker container.

---

## 📊 Service URLs (Local Development)

| Service | URL | Purpose |
|---------|-----|---------|
| Craftly API | http://localhost:8080 | Main backend API |
| MinIO Console | http://localhost:9091 | File storage dashboard |
| Qdrant Dashboard | http://localhost:6333/dashboard | Vector DB browser |
| PostgreSQL | localhost:5432 | Connect via DBeaver or psql |

---

## 🔑 Default Credentials (Local Only — NEVER use in production!)

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | craftly | craftly_secret |
| MinIO | minioadmin | minioadmin |
| Dev User | dev@craftly.local | password |

---

## 🏥 Health Checks

```bash
curl http://localhost:8080/api/auth/health
curl http://localhost:6333/healthz
curl http://localhost:9001/minio/health/live
```

---

## 🔑 Generating a Secure JWT Secret

```bash
openssl rand -base64 64
```

Paste the output as your JWT_SECRET_KEY.

---

## 📦 Build Production JAR

```bash
./mvnw.cmd clean package -DskipTests
# Output: target/lovable-clone-0.0.1-SNAPSHOT.jar
```

---

## 🐳 Docker Commands Reference

```bash
# Build image only
docker build -t craftly-api:latest .

# Run all services
docker compose up --build -d

# View logs for specific service
docker compose logs -f craftly-api

# Restart a service
docker compose restart craftly-api

# Shell into a running container
docker compose exec craftly-api sh

# Stop everything
docker compose down
```
