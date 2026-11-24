# NEXORA — Complete Runbook & System Architecture Guide

**Brand:** NEXORA  
**Tagline:** *Automate Beyond Limits.*  
**Supporting Line:** *Connect. Orchestrate. Automate.*  
**Document Purpose:** Complete, single-source operational runbook and architectural breakdown explaining **how to run the platform** and **how every component functions internally** ("Kevi rite kaam kare chhe").

---

## Table of Contents
1. [Part 1: How to Run NEXORA (Step-by-Step Quickstart)](#part-1-how-to-run-nexora-step-by-step-quickstart)
   - [1. Prerequisites](#1-prerequisites)
   - [2. Environment Configuration](#2-environment-configuration)
   - [3. Starting Docker Infrastructure (PostgreSQL & Redis)](#3-starting-docker-infrastructure-postgresql--redis)
   - [4. Applying Database Migrations (Prisma)](#4-applying-database-migrations-prisma)
   - [5. Running Automated Test Suites](#5-running-automated-test-suites)
   - [6. Starting Development Servers](#6-starting-development-servers)
   - [7. End-to-End Walkthrough via the Web UI](#7-end-to-end-walkthrough-via-the-web-ui)
   - [8. Production Docker Deployment](#8-production-docker-deployment)
2. [Part 2: How It Works ("Kevi Rite Kaam Kare Chhe" — Deep Dive)](#part-2-how-it-works-kevi-rite-kaam-kare-chhe--deep-dive)
   - [1. System Topology & Data Flow](#1-system-topology--data-flow)
   - [2. Authentication & Multi-Tenant Workspace Isolation](#2-authentication--multi-tenant-workspace-isolation)
   - [3. Visual Canvas & Graph Persistence](#3-visual-canvas--graph-persistence)
   - [4. Kahn's DAG Validation & Cycle Detection](#4-kahns-dag-validation--cycle-detection)
   - [5. Asynchronous Execution Engine & BullMQ Worker](#5-asynchronous-execution-engine--bullmq-worker)
   - [6. Webhook Publishing Lifecycle & Token Gateway](#6-webhook-publishing-lifecycle--token-gateway)
   - [7. Zero-Trust AES-256-GCM Credential Vault](#7-zero-trust-aes-256-gcm-credential-vault)
   - [8. Zero-Eval Conditional Branching & Subtree Pruning](#8-zero-eval-conditional-branching--subtree-pruning)
   - [9. SSRF Outbound Protection Engine](#9-ssrf-outbound-protection-engine)
   - [10. Real-Time Node Execution Timeline](#10-real-time-node-execution-timeline)
3. [Part 3: Verification & Common Troubleshooting](#part-3-verification--common-troubleshooting)

---

# Part 1: How to Run NEXORA (Step-by-Step Quickstart)

### 1. Prerequisites
Make sure your workstation has:
- **Node.js:** `v22.x` or `v24.x` (verified on Node `v24.22.1`)
- **npm:** `v10.x` or `v11.x`
- **Docker & Docker Compose:** Docker Desktop or Docker Engine running
- **Git**

---

### 2. Environment Configuration
Clone the repository and copy the environment variables:
```bash
git clone <repository_url> nexora
cd nexora
cp .env.example .env
```

Your root `.env` and `apps/api/.env` are pre-configured with secure development defaults:
```env
# Application
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3000

# Database (PostgreSQL 16)
# Note: Host port is mapped to 5433 to avoid collisions with any local PostgreSQL service on 5432
DATABASE_URL="postgresql://nexora:nexora_secret_password@localhost:5433/nexora?schema=public"

# Cache & Queues (Redis 7)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cryptography & Vault Security
JWT_SECRET=nexora_super_secret_jwt_developer_key_2026_x99!
JWT_EXPIRATION=7d
CREDENTIAL_ENCRYPTION_KEY=nexora_vault_master_key_32bytes_sec!

# Frontend Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

### 3. Starting Docker Infrastructure (PostgreSQL & Redis)
Nexora requires PostgreSQL (relational database) and Redis (queue message broker). Launch them in detached mode:
```bash
npm run infra:up
```
Verify both containers are `healthy`:
```bash
docker compose -f infrastructure/docker-compose.yml ps
```
You should see:
- `nexora-postgres` running on port `5433:5432` (`healthy`)
- `nexora-redis` running on port `6379:6379` (`healthy`)

---

### 4. Applying Database Migrations (Prisma)
Initialize the database tables (`users`, `workspaces`, `workflows`, `executions`, `credentials`, `webhook_endpoints`):
```bash
npm run db:migrate
```
*(Optional: inspect your live database visually using Prisma Studio via `npm run db:studio` on port 5555).*

---

### 5. Running Automated Test Suites
Run the full test suite across the repository using Vitest:
```bash
npm test
```
**What this validates:**
- 24 automated unit and integration tests verifying Kahn's DAG cycle detector, AST condition operators, SSRF security filters, AES-256-GCM vault cryptography, and the end-to-end critical execution path.

Also verify TypeScript compilation across all monorepo packages:
```bash
npm run typecheck
```

---

### 6. Starting Development Servers
Open two terminal windows:

#### Terminal 1 — Start NestJS Backend API (Port 4000)
```bash
npm run dev:api
```
- API Health Endpoint: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- Swagger OpenAPI Docs: [http://localhost:4000/docs](http://localhost:4000/docs)

#### Terminal 2 — Start Next.js Frontend (Port 3000)
```bash
npm run dev:web
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

### 7. End-to-End Walkthrough via the Web UI

Follow these steps in your browser to experience the full Nexora automation pipeline:

#### Step 1: User Registration
1. Navigate to [http://localhost:3000/register](http://localhost:3000/register).
2. Enter your name, email (e.g. `sarah@nexora.dev`), and password.
3. Upon registration, Nexora **automatically provisions your personal workspace** and assigns you the `OWNER` role.

#### Step 2: Securely Vault an API Credential
1. Click **"Credentials"** in the sidebar (or visit `/credentials`).
2. Click **"Add Credential"**.
3. Fill in:
   - **Identifier:** `STRIPE_KEY`
   - **Type:** `API_KEY`
   - **Secret Value:** `sk_live_51M0...sample_secret`
4. Click **"Vault Secret"**.
5. Notice that the secret is immediately encrypted via **AES-256-GCM**. The UI displays `sk_••••••••` and gives you a copyable placeholder tag: `{{credentials.STRIPE_KEY}}`.

#### Step 3: Build a Workflow Graph
1. Click **"Workflows"** in the sidebar $\rightarrow$ click **"New Workflow"**.
2. Give it a name (e.g. `Inbound Lead Router`).
3. In the React Flow canvas:
   - Click **Webhook Trigger** in the node palette.
   - Click **Condition** in the node palette.
   - Click **HTTP Request** in the node palette.
   - Click **Logger** in the node palette.
4. Connect the nodes:
   - Drag an edge from `Webhook Trigger` $\rightarrow$ `Condition`.
   - Drag an edge from `Condition` (TRUE handle) $\rightarrow$ `HTTP Request`.
   - Drag an edge from `Condition` (FALSE handle) $\rightarrow$ `Logger`.
5. Click **"Save"** in the top bar. The entire DAG graph is serialized and saved to PostgreSQL.

#### Step 4: Publish the Workflow
1. Click the **"Publish"** button in the canvas header.
2. Nexora validates that the graph has no cycles.
3. The status flips to **`LIVE`**, and the **Webhook Endpoint Modal** opens automatically.
4. Copy the unique public Webhook URL:
   `http://localhost:4000/api/v1/webhooks/<32-byte-token>`

#### Step 5: Trigger the Workflow via Inbound Webhook
Open a terminal and run the cURL command provided by the modal:
```bash
curl -X POST "http://localhost:4000/api/v1/webhooks/<PASTE_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{"event": "lead_created", "email": "alex@enterprise.com", "tier": "enterprise"}'
```
You will immediately receive an HTTP `202 Accepted` response with an `executionId`:
```json
{
  "success": true,
  "executionId": "8b94ec17-3bfb-426b-80fb-9bf48cfa1c30",
  "status": "QUEUED",
  "message": "Workflow execution triggered via webhook successfully"
}
```

#### Step 6: Inspect Real-Time Execution
1. Return to your canvas or go to **"Executions"** in the sidebar.
2. The canvas displays **real-time pulsing borders** and node execution badges:
   - Webhook Trigger: `✓ DONE`
   - Condition: `✓ DONE` (evaluated to `true`)
   - HTTP Request: `✓ DONE` (executed)
   - Logger: `SKIPPED` (pruned because condition was true)
3. Click the execution to see per-step timing, inputs, and outputs with zero leaked secrets.

---

### 8. Production Docker Deployment
To run the entire system in isolated production Docker containers:
```bash
docker compose -f infrastructure/docker-compose.prod.yml up -d --build
```
This builds and launches:
- `nexora-prod-postgres` (PostgreSQL 16)
- `nexora-prod-redis` (Redis 7)
- `nexora-prod-api` (NestJS on port 4000)
- `nexora-prod-web` (Next.js 15 Standalone on port 3000)

---

# Part 2: How It Works ("Kevi Rite Kaam Kare Chhe" — Deep Dive)

Here is an exhaustive, component-by-component explanation of how Nexora works under the hood.

```
                    NEXORA SYSTEM TOPOLOGY
  ┌────────────────────────────────────────────────────────┐
  │                   Next.js 15 Web UI                    │
  │   - React Flow Canvas       - Credential Vault Page    │
  │   - Real-time Node Badges   - Execution Timeline       │
  └───────────────────────────┬────────────────────────────┘
                              │ HTTP REST / Webhooks
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                   NestJS API Gateway                   │
  │   - Helmet Security         - Tenant Workspace Guard   │
  │   - Inbound Webhook Listener- Kahn's DAG Validator     │
  └─────────────┬────────────────────────────┬─────────────┘
                │                            │
                ▼                            ▼
  ┌──────────────────────────┐  ┌──────────────────────────┐
  │   PostgreSQL 16 DB       │  │      Redis 7 Broker      │
  │   - Workflows & Snapshots│  │   - BullMQ Queue         │
  │   - AES-GCM Encrypted    │  │   - Execution Jobs       │
  │     Credentials Vault    │  └────────────┬─────────────┘
  │   - Node Executions Logs │               │
  └──────────────────────────┘               ▼
                                ┌──────────────────────────┐
                                │   BullMQ Worker Runner   │
                                │   - Topological Engine   │
                                │   - SSRF Guard Validator │
                                │   - Zero-Eval Conditions │
                                │   - In-Memory Secret Res │
                                └──────────────────────────┘
```

---

### 1. System Topology & Data Flow
When an automation event occurs, the request flows through these layers:
1. **Trigger:** Event arrives via manual canvas button (`POST /workflows/:id/run`) or public inbound webhook (`POST /webhooks/:token`).
2. **Ingress Validation:** The API validates payload size (< 1MB) and rate limits (120 req/min).
3. **Queue Enqueue:** The workflow execution is persisted as `QUEUED` in PostgreSQL and pushed into BullMQ via Redis.
4. **Worker Pick-up:** The BullMQ worker receives the job, sets status to `RUNNING`, loads the immutable workflow version, and calculates execution order.
5. **Step Execution:** Nodes execute sequentially in topological order. Step outputs are stored in `executionContext.steps[nodeId]`.
6. **Persistence:** Each node step records `status`, `durationMs`, and sanitized `outputData` in the `node_executions` table.
7. **Client Feedback:** The web client polls or streams the execution status, lighting up node borders and execution logs.

---

### 2. Authentication & Multi-Tenant Workspace Isolation
- **Password Security:** Passwords are hashed using `bcryptjs` with salt rounds. Plaintext passwords never touch logs or databases.
- **Tenant Isolation:** Every user belongs to one or more Workspaces. All database queries for workflows, credentials, and executions strictly require `workspaceId`.
- **Guards:**
  - `JwtAuthGuard`: Decodes JWT token and validates user signature.
  - `WorkspaceGuard`: Reads the `x-workspace-id` header and verifies the user is an active member with `OWNER`, `ADMIN`, or `MEMBER` privileges. It is impossible for Tenant A to query or mutate Tenant B's data.

---

### 3. Visual Canvas & Graph Persistence
- Built using `@xyflow/react` (React Flow v12).
- Nodes and edges are stored in a sanitized JSON schema:
  ```json
  {
    "nodes": [
      { "id": "node_1", "type": "webhook-trigger", "position": { "x": 100, "y": 100 }, "data": { ... } }
    ],
    "edges": [
      { "id": "e1", "source": "node_1", "target": "node_2", "sourceHandle": "true" }
    ]
  }
  ```
- **Immutable Version Snapshots:** Every time a user updates a workflow graph, Nexora increments `currentVersion` (e.g. v1 $\rightarrow$ v2) and creates an immutable snapshot in `workflow_versions`. Running executions always execute against their pinned version snapshot.

---

### 4. Kahn's DAG Validation & Cycle Detection
Before any workflow can be saved, run, or published, it passes through `ValidatorService.validateGraph()` which implements **Kahn's Algorithm**:
1. Calculates the **in-degree** (number of incoming edges) for every node.
2. Pushes all nodes with `inDegree === 0` into a processing queue.
3. While the queue is not empty:
   - Dequeues node $U$ and appends it to `executionOrder`.
   - For every neighbor $V$ connected to $U$, decrements $V$'s in-degree.
   - If $V$'s in-degree reaches 0, pushes $V$ into the queue.
4. **Cycle Detection:** If the length of `executionOrder` does not equal the total number of nodes in the graph, a circular dependency exists (e.g. $A \rightarrow B \rightarrow C \rightarrow A$). Nexora rejects the workflow and lists the exact offending nodes.

---

### 5. Asynchronous Execution Engine & BullMQ Worker
- Implemented in `apps/api/src/modules/engine/execution.worker.ts`.
- Operates on a dedicated BullMQ queue (`nexora-workflow-executions`) connected to Redis.
- Concurrency is managed asynchronously (default 5 concurrent jobs).
- **Execution Context:**
  ```ts
  const executionContext = {
    trigger: triggerPayload.body,
    $trigger: triggerPayload,
    steps: {
      node_1: { ...outputData },
      node_2: { ...outputData }
    }
  };
  ```
  Downstream nodes reference upstream data seamlessly using template syntax:
  `{{trigger.email}}` or `{{steps.node_1.data.id}}`.

---

### 6. Webhook Publishing Lifecycle & Token Gateway
How webhook triggering works without compromising system security:
1. When a user clicks **"Publish"**:
   - The backend generates a 32-byte cryptographically secure random token (`crypto.randomBytes(32).toString('hex')`).
   - The raw token is returned **once** to the user in the UI.
   - Only the **SHA-256 hash** of the token is saved in the `webhook_endpoints` table (`tokenHash`).
2. When an external service sends an HTTP POST request to `/api/v1/webhooks/:token`:
   - The gateway hashes the incoming `:token` using SHA-256.
   - It performs an exact lookup on `webhook_endpoints` where `isActive === true`.
   - If active, it inspects payload size (< 1MB) and enforces a 120 req/min sliding-window rate limit.
   - It enqueues the job with `triggerType: 'WEBHOOK'` and returns `202 Accepted` immediately.

---

### 7. Zero-Trust AES-256-GCM Credential Vault
Implemented in `apps/api/src/modules/credentials/encryption.service.ts`:
- **Algorithm:** Authenticated `AES-256-GCM`.
- **Key Derivation:** Master key is stretched using SHA-256.
- **Random IV:** Every stored credential generates a fresh, random 16-byte Initialization Vector (IV). Encrypting the exact same API key twice produces completely different ciphertexts.
- **Auth Tag:** AES-GCM generates a 16-byte authentication tag that detects any bit-flipping or database tampering.
- **Zero-Leak Logging Rule:**
  - Credentials are decrypted **strictly in worker memory** just-in-time before making an external HTTP fetch.
  - Plaintext secrets are **never** stored in `node_executions.inputData`, `node_executions.outputData`, or database tables.
  - Any headers matching vaulted credentials or standard sensitive tokens (`Authorization`, `x-api-key`, `cookie`) are masked with `[REDACTED]` before saving execution audit logs.

---

### 8. Zero-Eval Conditional Branching & Subtree Pruning
- Implemented in `apps/api/src/modules/engine/node-handlers/condition.handler.ts`.
- **Zero-Eval Guarantee:** Evaluates conditions via safe abstract syntax comparison. Never calls JavaScript `eval()`, `Function()`, or shell commands.
- **Supported Operators:**
  - `equals`, `not_equals`
  - `contains`, `not_contains`
  - `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`
  - `is_empty`, `is_not_empty`
- **Dynamic Subtree Pruning:**
  - The Condition node outputs `branch: "true"` or `branch: "false"`.
  - The worker inspects outbound edges. If an edge is attached to `sourceHandle: "false"` while the condition evaluated to `true`, the worker automatically **prunes the entire disabled branch**.
  - All downstream nodes on the inactive path are recorded in the database as `status: "SKIPPED"` with `durationMs: 0`.

---

### 9. SSRF Outbound Protection Engine
Implemented in `apps/api/src/modules/engine/security/ssrf-validator.ts`:
- External HTTP requests made by workflow nodes could be manipulated to attack internal services.
- Nexora enforces a DNS-resolution validation check **before** opening any socket:
  1. Resolves the hostname to its underlying IP addresses using `dns.lookup`.
  2. Blocks Loopback: `127.0.0.0/8`, `localhost`, `::1`.
  3. Blocks RFC 1918 Private Subnets: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
  4. Blocks Link-Local & Cloud Metadata: `169.254.169.254` (prevents stealing AWS/GCP/Azure instance credentials).
  5. Enforces HTTP/HTTPS protocol whitelist (rejects `file://`, `gopher://`, `ftp://`).

---

### 10. Real-Time Node Execution Timeline
- When an execution is triggered, the web client polls `GET /api/v1/executions/:id` every 600ms (backed by PostgreSQL indexes).
- The canvas maps step statuses to visual CSS states:
  - `RUNNING`: Electric Cyan pulsing border (`border-[#22D3EE] ring-2 ring-[#22D3EE]/50 animate-pulse`).
  - `SUCCEEDED`: Emerald green border with checkmark (`border-[#22C55E]`).
  - `FAILED`: Red border with error banner (`border-[#EF4444]`).
  - `SKIPPED`: Dimmed opacity (`opacity-40`).
- The user can click any step in the Execution Drawer to inspect the exact input payload, output data, and duration in milliseconds.

---

# Part 3: Verification & Common Troubleshooting

### 1. Database Connection Error (Port 5432 vs 5433)
- **Symptom:** `P1000: Authentication failed against database server`.
- **Cause:** Native Windows PostgreSQL service is already listening on default port `5432`.
- **Solution:** Nexora's Docker container is mapped to host port `5433:5432`. Always use `localhost:5433` in your `.env`:
  `DATABASE_URL="postgresql://nexora:nexora_secret_password@localhost:5433/nexora?schema=public"`

### 2. Redis Connection Refused
- **Symptom:** `ECONNREFUSED 127.0.0.1:6379`.
- **Solution:** Ensure Docker Redis is running:
  ```bash
  npm run infra:up
  ```

### 3. Resetting the Database to a Clean State
If you ever want to wipe test data and start fresh:
```bash
npx prisma migrate reset --schema=apps/api/prisma/schema.prisma
```
This re-applies all migrations cleanly and seeds a fresh database.

---

### Summary Checklist of All Available Commands

| Command | Purpose |
|---|---|
| `npm run infra:up` | Boots PostgreSQL 16 & Redis 7 Docker containers |
| `npm run infra:down` | Stops local Docker infrastructure |
| `npm run db:migrate` | Applies Prisma migrations to the database |
| `npm run db:studio` | Opens visual Prisma database GUI in your browser |
| `npm test` | Runs the full 24-test Vitest unit and integration suite |
| `npm run typecheck` | Validates strict TypeScript compilation across all packages |
| `npm run build` | Compiles Next.js standalone and NestJS production artifacts |
| `npm run dev:api` | Starts backend NestJS API server on port 4000 |
| `npm run dev:web` | Starts frontend Next.js 15 web app on port 3000 |
| `npm run dev:all` | Starts both frontend and backend concurrently |
