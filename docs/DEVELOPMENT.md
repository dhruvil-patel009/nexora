# NEXORA — Developer Setup & Operational Guide

**Brand:** NEXORA  
**Tagline:** *Automate Beyond Limits.*  
**Supporting Line:** *Connect. Orchestrate. Automate.*

---

## 1. Prerequisites

Ensure your development machine has the following tools installed:
- **Node.js:** `v22.x` or `v24.x` (LTS recommended)
- **npm:** `v10.x` or `v11.x`
- **Docker:** `v24.x` or higher
- **Docker Compose:** `v2.x` or higher

---

## 2. Quickstart: Booting from Scratch

### Step 1: Clone and Install Dependencies
```bash
git clone <repository_url> nexora
cd nexora
npm install
```

### Step 2: Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Ensure ports do not conflict with local services:
- `POSTGRES_PORT`: Default is `5433` (maps to internal `5432` to avoid conflicts with native PostgreSQL)
- `REDIS_PORT`: `6379`
- `DATABASE_URL`: `postgresql://nexora:nexora_secret_password@localhost:5433/nexora?schema=public`

### Step 3: Boot Infrastructure Services
Spin up local PostgreSQL 16 and Redis 7 in detached mode:
```bash
npm run infra:up
```
Verify container health:
```bash
docker compose -f infrastructure/docker-compose.yml ps
```

### Step 4: Run Database Migrations
Apply the initial Prisma schema to PostgreSQL:
```bash
npm run db:migrate
```

### Step 5: Start Applications in Development Mode
Launch both Next.js 15 (frontend) and NestJS (backend API):
```bash
# In terminal 1: Start Backend API (Port 4000)
npm run dev:api

# In terminal 2: Start Frontend Web Application (Port 3000)
npm run dev:web
```
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Swagger Documentation:** [http://localhost:4000/docs](http://localhost:4000/docs)

---

## 3. Running Verification & Quality Checks

### Run All Automated Tests
Executes unit and integration test suites:
```bash
npm test
```

### Typecheck Across All Workspaces
Ensures strict TypeScript compilation across `@nexora/shared`, `@nexora/api`, and `@nexora/web`:
```bash
npm run typecheck
```

### Production Build
Builds standalone Next.js bundles and compiled NestJS artifacts:
```bash
npm run build
```

---

## 4. Architecture & Security Guarantees

1. **DAG Cycle Prevention:** All workflow graphs are validated via **Kahn's Algorithm** before saving or execution. Cycles and dangling handles are rejected immediately.
2. **Zero-Eval Execution:** Condition nodes evaluate logical operators (`equals`, `not_equals`, `contains`, `greater_than`, `is_empty`) via AST comparison. Dynamic `eval()`, `Function()`, or shell execution is strictly forbidden.
3. **SSRF Guard:** HTTP Request nodes resolve DNS hostnames before socket connection, blocking loopback (`127.0.0.0/8`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata IP (`169.254.169.254`).
4. **AES-256-GCM Credential Vault:** Credentials are encrypted at rest with unique 16-byte random IVs and 16-byte authentication tags. Decryption happens strictly in worker memory just-in-time, and sensitive tokens are permanently redacted from execution logs.
5. **Inbound Webhook Security:** Webhook endpoints use 32-byte cryptographically secure random tokens. Tokens are stored as SHA-256 hashes with sliding-window rate limiting (120 req/min) and a 1MB payload ceiling.

---

## 5. Production Docker Deployment

Deploy the complete multi-container production stack:
```bash
docker compose -f infrastructure/docker-compose.prod.yml up -d --build
```
This launches:
- `nexora-prod-postgres` (PostgreSQL 16)
- `nexora-prod-redis` (Redis 7)
- `nexora-prod-api` (NestJS on Port 4000)
- `nexora-prod-web` (Next.js 15 Standalone on Port 3000)
