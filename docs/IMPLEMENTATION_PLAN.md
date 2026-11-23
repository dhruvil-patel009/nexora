# NEXORA Implementation Plan & Roadmap

**Brand:** NEXORA  
**Tagline:** Automate Beyond Limits.  
**Supporting Line:** Connect. Orchestrate. Automate.  
**Document Purpose:** Living roadmap and execution tracking across all delivery phases.

---

## 1. Roadmap Overview & Status Matrix

| Phase | Title | Description | Status |
|---|---|---|---|
| **Phase 0** | **Repository Inspection & Planning** | Inspect repo, establish architecture docs, plan structure | **Complete** |
| **Phase 1** | **Foundation & Local Infrastructure** | Monorepo layout, Docker Compose (PG+Redis), NestJS + Next.js init, Prisma setup | **Complete** |
| **Phase 2** | **Design System & Application Shell** | Nexora theme, navigation layout, sidebar, page shells, empty/loading states | **Complete** |
| **Phase 3** | **Authentication & Workspace Foundation** | User registration/login, JWT guards, workspace membership, protected routes | **Complete** |
| **Phase 4** | **Workflow CRUD & Graph Persistence** | Workflow API, React Flow canvas, node palette, graph serializer, unsaved changes | **Pending Approval** |
| **Phase 5** | **Validation & First Execution Slice** | DAG cycle check, BullMQ runner, Manual Trigger + Logger execution vertical slice | Pending |
| **Phase 6** | **HTTP Request & Condition Nodes** | HTTP node with SSRF guard, AST-based Condition evaluator, test inputs | Pending |
| **Phase 7** | **Webhooks, Publishing & Live Monitoring** | Public webhook endpoints, rate limits, Socket.IO live updates, execution timeline | Pending |
| **Phase 8** | **Credentials & Integrations Foundation** | AES-256-GCM encrypted credential vault, HTTP auth resolution, integration test UI | Pending |
| **Phase 9** | **Testing, Hardening & Deployment** | End-to-end testing, security audits, Docker packaging, CI pipeline, setup docs | Pending |
| **Phase 10**| **Post-MVP Enhancements** | Natural language AI generator, templates gallery, retry policies, scheduled cron | Deferred |

---

## 2. Phase-by-Phase Detailed Specifications

### Phase 0: Repository Inspection & Planning (Current Phase)
- **Goal:** Understand existing repo, preserve all work, establish architecture and implementation plan without writing destructive code.
- **Tasks:**
  - [x] Inspect existing files, package managers, scripts, and git status.
  - [x] Confirm tools available in environment (`node v24.22.1`, `npm 11.19.1`, `docker 29.6.2`, `docker compose v5.3.1`).
  - [x] Author comprehensive system architecture specification in `docs/ARCHITECTURE.md`.
  - [x] Author implementation roadmap and detailed Phase 1 task breakdown in `docs/IMPLEMENTATION_PLAN.md`.
  - [ ] Submit Phase 0 report and await explicit user approval before executing Phase 1.
- **Acceptance Criteria:**
  - Existing `README.md` and `NEXORA_BUILD_BLUEPRINT.md` are preserved.
  - Clean monorepo structure and package manager (`npm workspaces`) established.
  - Clear, actionable Phase 1 tasks presented for user sign-off.

---

### Phase 1: Foundation & Local Infrastructure
- **Goal:** Stand up the runnable monorepo skeleton, local database, cache containers, Prisma ORM, health checks, and strict TypeScript configurations.
- **Tasks Breakdown:**
  1. **Monorepo & Package Configuration:**
     - Initialize root `package.json` with npm workspaces (`apps/*`, `packages/*`).
     - Configure root `.gitignore` (ignoring `.env`, `node_modules`, `dist`, `.next`, `coverage`).
     - Create root `.env.example` with documented environment placeholders.
  2. **Infrastructure (Docker Compose):**
     - Create `infrastructure/docker-compose.yml` containing:
       - PostgreSQL 16 (health check, persistent volume, default database `nexora`).
       - Redis 7 Alpine (health check, persistent volume, default port 6379).
  3. **Backend Application Initialization (`apps/api`):**
     - Initialize NestJS project in `apps/api` using TypeScript in strict mode.
     - Configure `@nestjs/config` for schema-validated environment loading.
     - Set up Prisma ORM (`apps/api/prisma/schema.prisma`) with initial baseline schema (User, Workspace, WorkspaceMember, Workflow, Execution, Credential).
     - Configure health check endpoint (`GET /api/v1/health`) checking database and Redis connectivity.
  4. **Frontend Application Initialization (`apps/web`):**
     - Initialize Next.js 15 (App Router) in `apps/web` with TypeScript strict mode and Tailwind CSS.
     - Configure path aliases (`@/*`).
     - Configure base metadata and title: "NEXORA | Automate Beyond Limits".
  5. **Shared Package Initialization (`packages/shared`):**
     - Create `packages/shared` for cross-cutting TypeScript interfaces and enums (Workflow status, Node types, Execution status).
- **Acceptance Criteria:**
  - Docker Compose spins up PostgreSQL and Redis successfully.
  - Prisma generates client and connects cleanly.
  - `GET /api/v1/health` returns `200 OK` with database and redis statuses.
  - Next.js development server runs on port 3000.
  - Zero plaintext secrets committed.

---

### Phase 2: Design System & Application Shell
- **Goal:** Implement Nexora's premium developer-first visual identity, navigation, and core page shells.
- **Tasks Breakdown:**
  - Configure Tailwind theme tokens:
    - Midnight Navy (`#101827`)
    - Deep Slate (`#172D43`)
    - Electric Cyan (`#22D3EE`)
    - Neon Violet (`#8B5CF6`)
    - Soft White (`#F8FAFC`)
    - Slate Grey (`#64748B`)
  - Create geometric Nexora SVG brand mark and favicon (connected-node motif).
  - Build responsive application layout:
    - Collapsible persistent sidebar with active link states.
    - Top bar with workspace selector, user profile menu, and status banner.
  - Create page shells with honest empty and loading states:
    - `/dashboard`
    - `/workflows`
    - `/executions`
    - `/integrations`
    - `/credentials`
    - `/settings`
  - Install and configure Lucide icons and basic shadcn/ui primitives.
- **Acceptance Criteria:**
  - Navigation between all pages works smoothly.
  - Dark-first aesthetic matches design guidelines with accessible contrast.
  - Empty states are clear and do not fabricate metrics or mock data.

---

### Phase 3: Authentication & Workspace Foundation
- **Goal:** Implement secure user authentication and multi-tenant workspace isolation.
- **Tasks Breakdown:**
  - Backend auth module:
    - Password hashing using Argon2 or bcrypt.
    - `POST /api/v1/auth/register` (creates user and auto-provisions personal default workspace).
    - `POST /api/v1/auth/login` (issues secure JWT token).
    - `GET /api/v1/auth/me` (returns current user profile and workspaces).
  - Workspace guard & context interceptor to enforce tenant isolation on all queries.
  - Frontend auth forms:
    - `/login` with validation and error toast notifications.
    - `/register` with password strength indicators.
    - Route protection middleware redirecting unauthenticated users to `/login`.
- **Acceptance Criteria:**
  - Users can register, log in, and view their workspace.
  - Protected API routes reject unauthenticated requests with `401 Unauthorized`.
  - Workspace scoping guarantees users cannot access other tenants' records.

---

### Phase 4: Workflow CRUD & Graph Persistence
- **Goal:** Enable users to visually construct, edit, save, and reload workflow graphs.
- **Tasks Breakdown:**
  - Workflow database schema and REST API endpoints:
    - `GET /api/v1/workflows` (searchable list)
    - `POST /api/v1/workflows` (create)
    - `GET /api/v1/workflows/:id` (fetch definition)
    - `PATCH /api/v1/workflows/:id` (update definition & metadata)
    - `DELETE /api/v1/workflows/:id` (archive/delete)
  - Visual canvas integration (`apps/web`):
    - Install and configure `@xyflow/react` (React Flow).
    - Create custom node components: Manual Trigger, Webhook Trigger, HTTP Request, Condition, Delay, Logger.
    - Implement drag-and-drop node palette.
    - Implement interactive edge connections with custom styling.
    - Build slide-over node configuration inspector panel.
    - Implement auto-save / explicit save with dirty state indicator.
- **Acceptance Criteria:**
  - Workflows can be created, edited, saved to PostgreSQL, and reloaded identically.
  - Definitions are strictly sanitized (zero credentials stored in node data).

---

### Phase 5: Validation & First Execution Vertical Slice
- **Goal:** Deliver an end-to-end working execution engine running a real workflow.
- **Tasks Breakdown:**
  - Graph validator service:
    - Implement topological sort and cycle detection (Kahn's algorithm).
    - Enforce single-trigger constraints and valid handle connections.
  - Queue worker setup:
    - Configure BullMQ with Redis connection pool.
    - Create `ExecutionWorker` processor.
  - Execution runtime:
    - Persist execution records (`queued` -> `running` -> `succeeded` / `failed`).
    - Implement `ManualTrigger` handler (ingests test input).
    - Implement `Logger` handler (formats and stores step output).
    - Execute nodes in sequence and record timing, status, and outputs.
  - Frontend execution trigger:
    - "Run Workflow" button in editor header.
    - Execution drawer displaying node execution steps, duration, and output logs.
- **Acceptance Criteria:**
  - A `Manual Trigger -> Logger` workflow triggers, executes asynchronously via BullMQ, and updates status in PostgreSQL.
  - Real step output is displayed in the UI without mock data.

---

### Phase 6: HTTP Request & Condition Nodes
- **Goal:** Add external API capability and conditional branching to the execution engine.
- **Tasks Breakdown:**
  - HTTP Request Node:
    - Handler supporting `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
    - Timeout configuration (default 10s, max 30s) and payload size limit (max 1MB).
    - SSRF prevention filter (resolves IP, blocks private subnets, loopbacks, cloud metadata `169.254.169.254`).
    - Redaction of sensitive headers in execution logs.
  - Condition Node:
    - AST-based rule evaluator supporting: `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`.
    - True/False dual output handles on canvas.
    - Branch-aware execution runner (skips disabled branch).
  - Node test runner UI (allows testing single node with sample payload).
- **Acceptance Criteria:**
  - HTTP Request node reliably queries external public APIs while blocking internal IPs.
  - Condition node routes execution path dynamically without any `eval()` execution.

---

### Phase 7: Webhooks, Publishing & Live Monitoring
- **Goal:** Allow workflows to be triggered via inbound webhooks and monitor executions in real time.
- **Tasks Breakdown:**
  - Workflow publishing lifecycle (`draft` vs `published` versions).
  - Webhook gateway:
    - Unique token generation (`crypto.randomBytes(32)`).
    - Endpoint: `POST /api/v1/webhooks/:token`.
    - Rate limiter (express-rate-limit or Redis-based sliding window).
    - Payloads passed directly into trigger node context.
  - Real-time updates:
    - Socket.IO gateway on NestJS.
    - React hook `useExecutionSocket` streaming node start/finish events.
    - Canvas visual node glow/border pulse during execution.
  - Execution history view:
    - Filterable execution list (`/executions`).
    - Granular timeline view (`/executions/[id]`).
- **Acceptance Criteria:**
  - Inbound webhook triggers workflow execution asynchronously.
  - Canvas updates live step-by-step as worker processes nodes.

---

### Phase 8: Credentials & Integrations Foundation
- **Goal:** Provide enterprise-grade secret management and integration connectivity.
- **Tasks Breakdown:**
  - Encrypted Credential Service:
    - AES-256-GCM encryption with workspace-isolated secrets.
    - Write-only secret endpoints (`POST /api/v1/credentials`, `GET` returns masked info).
  - Credential injection:
    - In HTTP Request node, resolve `{{credentials.name.token}}` securely in worker memory.
    - Ensure plaintext values never enter logs, database, or network responses.
  - Integrations catalogue page (`/integrations`):
    - Display supported integrations (Webhook, Generic HTTP, Slack Webhook, GitHub).
    - Real connection verification checks.
- **Acceptance Criteria:**
  - Credentials encrypted at rest with verified authentication tags.
  - Zero plaintext secrets ever leaked to frontend or logs.

---

### Phase 9: Testing, Hardening & Deployment
- **Goal:** Thorough automated testing, security audit, container packaging, and documentation.
- **Tasks Breakdown:**
  - Unit tests for DAG validator, cycle detector, condition evaluator, and SSRF filter.
  - Integration tests for auth, workflow persistence, and execution queue.
  - Production containerization:
    - `Dockerfile` for `apps/api` (multi-stage build).
    - `Dockerfile` for `apps/web` (standalone output).
    - Production `docker-compose.prod.yml`.
  - Security hardening (CORS whitelist, Helmet headers, rate limiting).
  - Setup and developer documentation (`docs/DEVELOPMENT.md`, `docs/API.md`).
- **Acceptance Criteria:**
  - All test suites pass.
  - Production builds of web and api succeed.
  - Fresh clone can be booted using documented setup steps.

---

### Phase 10: Post-MVP Enhancements (Deferred)
- AI-assisted natural language workflow generation.
- Public template gallery.
- Scheduled cron triggers.
- Parallel branch execution and sub-workflows.
- Team invitations and granular role permissions.
