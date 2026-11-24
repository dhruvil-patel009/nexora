# NEXORA 🚀
### *Automate Beyond Limits.*
**Connect. Orchestrate. Automate.**

Nexora is a developer-first visual workflow automation and orchestration SaaS platform designed to construct, execute, and monitor complex Directed Acyclic Graph (DAG) automations through an intuitive node-based canvas.

---

## 📖 Comprehensive Guides & Documentation

- 📘 **[HOW_TO_RUN_AND_SYSTEM_GUIDE.md](docs/HOW_TO_RUN_AND_SYSTEM_GUIDE.md)**: Exhaustive step-by-step operational runbook and deep-dive architectural breakdown of every internal component.
- 📐 **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Monorepo system topology, security boundaries, and domain models.
- 🗺️ **[IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)**: 10-phase delivery status matrix and verification audit.
- 🌐 **[API.md](docs/API.md)**: REST & Inbound Webhook API documentation with cURL examples.
- 🛠️ **[DEVELOPMENT.md](docs/DEVELOPMENT.md)**: Developer quickstart, environment variables, and Docker deployment.

---

## ⚡ Quickstart: How to Run Nexora

### 1. Prerequisites
- **Node.js:** `v22.x` or `v24.x` (LTS)
- **npm:** `v10.x` or `v11.x`
- **Docker & Docker Compose**

### 2. Setup & Environment
```bash
# Clone and install dependencies
git clone <repository_url> nexora
cd nexora
npm install

# Setup environment configuration
cp .env.example .env
```

### 3. Start Infrastructure & Migrate Database
```bash
# Start PostgreSQL 16 (port 5433) and Redis 7 (port 6379)
npm run infra:up

# Run Prisma database migrations
npm run db:migrate
```

### 4. Run Automated Test Suite
```bash
# Runs 24 unit & integration tests (DAG, Condition, SSRF, AES-256-GCM Crypto)
npm test

# Verify strict TypeScript across all workspaces
npm run typecheck
```

### 5. Start Development Servers
In two separate terminals:
```bash
# Terminal 1: Backend API (Port 4000)
npm run dev:api

# Terminal 2: Frontend Next.js 15 (Port 3000)
npm run dev:web
```
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Swagger OpenAPI Docs:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🛠️ Technology Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend Application** | Next.js 15 (App Router), React 19, TypeScript (Strict), Tailwind CSS |
| **Visual Workflow Canvas** | `@xyflow/react` (React Flow v12) custom connected node graph |
| **Backend API Gateway** | NestJS 10, Express, Helmet, Swagger OpenAPI, Class Validator |
| **Execution Engine** | BullMQ, Redis 7 (Asynchronous queue processor, Kahn's DAG sort) |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 6.x |
| **Security & Cryptography** | AES-256-GCM Vault, SSRF DNS Resolution Guard, SHA-256 Webhook Tokens |
| **Automated Testing** | Vitest 5.x (Unit & Integration test runner) |

---

## 🔒 Security Principles

1. **Zero-Trust Credential Security:** Integration secrets are encrypted at rest with **AES-256-GCM** using unique random IVs and authentication tags. Decryption occurs strictly in worker memory just-in-time before HTTP requests. Secrets are **never** logged or persisted in execution history.
2. **SSRF Guard:** HTTP Request nodes resolve DNS hostnames before socket connection, blocking loopbacks, RFC 1918 private subnets, and cloud instance metadata (`169.254.169.254`).
3. **Zero-Eval Conditional Branching:** Condition nodes evaluate safe operators without any dynamic JavaScript `eval()` or shell execution. Inactive branches are automatically pruned and marked `SKIPPED`.
4. **Kahn's DAG Cycle Detector:** Cycles ($A \rightarrow B \rightarrow A$) and dangling handles are rejected before execution.

---

## 📦 Production Container Deployment

To launch the multi-container production stack:
```bash
docker compose -f infrastructure/docker-compose.prod.yml up -d --build
```
Orchestrates:
- `nexora-prod-postgres` (PostgreSQL 16)
- `nexora-prod-redis` (Redis 7)
- `nexora-prod-api` (NestJS production container)
- `nexora-prod-web` (Next.js 15 Standalone production container)
