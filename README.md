# 🚀 Craftly — AI-Powered Code Generation & Development Platform (Lovable / Bolt Backend Clone)

Craftly is an enterprise-grade Spring Boot 3 backend platform powering AI-driven full-stack application creation, real-time code streaming, container preview execution, vector code retrieval (RAG), rate limiting, and Stripe billing.

---

## 🏗️ Core Architecture & Subsystems Overview

```
                               ┌─────────────────────────────────────────┐
                               │       REST & SSE API LAYER :8080        │
                               │  Auth | Project | File | Chat | Preview │
                               │     Usage | Subscriptions | Actuator    │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 │                                  │                                  │
    ┌────────────▼───────────┐         ┌────────────▼───────────┐         ┌────────────▼───────────┐
    │  PostgreSQL 16         │         │  MinIO S3 Storage      │         │  Qdrant Vector DB      │
    │  (Relational Data)     │         │  (Workspace Files)     │         │  (Code RAG Search)     │
    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘
                 │                                  │                                  │
    ┌────────────▼───────────┐         ┌────────────▼───────────┐         ┌────────────▼───────────┐
    │  Apache Kafka          │         │  Redis Cache           │         │  Zipkin Telemetry      │
    │  (Event Streaming)     │         │  (Rate Limiting)       │         │  (Distributed Tracing) │
    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘
```

---

## 🌟 Key Features

* **🔐 Authentication & Security**: JWT-based stateless authentication with BCrypt password hashing.
* **📁 MinIO S3 Object Storage**: Workspace file management with streaming ZIP project exports (`/download`).
* **🤖 AI Code Generation Engine**: Structured response generation powered by Gemini 1.5 Flash API with smart mock fallback generator.
* **⚡ Server-Sent Events (SSE) Streaming**: Real-time token-by-token code streaming via `text/event-stream`.
* **🧠 Retrieval-Augmented Generation (RAG)**: Qdrant Vector DB integration with 25-line sliding window code chunking & Cosine similarity embeddings.
* **🐳 Container Preview Execution**: Isolated container workspace previews with live console log streaming over SSE.
* **⏱️ Quota & Rate Limit Enforcement**: Aspect-oriented `@RequireQuota` annotations + Redis sliding window rate limiter (100 req/min).
* **💳 Stripe Billing & Subscriptions**: Signature-verified webhooks (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`) with automatic plan upgrades and downgrades.
* **📡 Apache Kafka Event Streaming**: Asynchronous event publishing across topics `craftly.ai.events`, `craftly.usage.audit`, `craftly.preview.logs`.
* **🔍 Distributed Tracing & Telemetry**: Micrometer Tracing & Zipkin reporter Integration (`http://localhost:9411/api/v2/spans`).

---

## 📋 Technology Stack

* **Language & Framework**: Java 21, Spring Boot 4.1.0 (Spring Framework 7.0)
* **Database**: PostgreSQL 16 (Relational DB), H2 (In-Memory Testing)
* **Object Storage**: MinIO S3 SDK (`io.minio:minio:8.5.12`)
* **Vector DB**: Qdrant REST Vector Database (`qdrant/qdrant:latest`)
* **Event Broker**: Apache Kafka (`org.springframework.kafka:spring-kafka`)
* **Caching & Rate Limiting**: Redis (`spring-boot-starter-data-redis`)
* **Telemetry**: Micrometer Tracing, Zipkin Reporter, Spring Boot Actuator
* **Billing**: Stripe Java SDK (`com.stripe:stripe-java:26.0.0`)
* **Build Tool**: Apache Maven Wrapper (`./mvnw.cmd`)

---

## 🛠️ Local Development & Docker Setup

### Option 1: One-Click Docker Compose
Starts PostgreSQL, MinIO, Qdrant, and Spring Boot API:

```bash
docker compose up --build -d
```

### Option 2: Run via Maven
```bash
./mvnw.cmd spring-boot:run
```

### Option 3: Build Production Executable JAR
```bash
./mvnw.cmd clean package -DskipTests
java -jar target/lovable-clone-0.0.1-SNAPSHOT.jar
```

---

## 🚀 Live Cloud Deployment

* **Live API Host**: Render / Railway / Cloud Provider
* **Database Host**: Managed PostgreSQL
* **Setup Documentation**: See [SETUP.md](file:///c:/Users/subod/OneDrive/Desktop/Skills/Spring%200%20-100/lovable-clone/SETUP.md) for full deployment instructions.

---

## 📝 License
Proprietary — All rights reserved.
