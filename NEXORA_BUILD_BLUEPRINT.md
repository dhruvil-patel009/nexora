# NEXORA --- Product Build Blueprint & Antigravity Master Prompt

**Brand:** NEXORA\
**Tagline:** Automate Beyond Limits.\
**Product type:** Premium, developer-first workflow automation SaaS\
**Document purpose:** Give Antigravity AI a clear product specification,
implementation plan, architecture, and working rules so it can build
Nexora incrementally without losing context.

------------------------------------------------------------------------

## 1. Product vision

Nexora is a visual workflow automation and orchestration platform. Users
create workflows by connecting trigger, action, and logic nodes on a
visual canvas. They can configure integrations, run workflows, inspect
execution history, and understand failures.

The product should feel like a polished, production-minded SaaS---not a
generic CRUD dashboard or a static UI demo.

### Core product promise

**Connect. Orchestrate. Automate.**

### Target users

-   Developers who need to connect APIs and automate repetitive tasks.
-   Small teams that want to automate internal business processes.
-   Technical operators who need visibility into workflow runs and
    failures.

### Product principles

1.  **Visual first:** workflows are designed on a node-based canvas.
2.  **Reliable execution:** workflows execute on the backend, not in the
    browser.
3.  **Observable by default:** every run has status, timestamps, step
    results, and useful logs.
4.  **Secure by design:** credentials are never exposed in plaintext to
    the frontend or logs.
5.  **Incremental delivery:** build a working vertical slice before
    adding advanced features.
6.  **Honest UI:** never show fake success, fake metrics, or pretend
    integrations are connected.

------------------------------------------------------------------------

## 2. MVP scope

Build the following in order. Do not start advanced AI features until
the core workflow engine works.

### MVP features

-   Authentication (email/password; use a development-safe local setup
    first).
-   Workspace-aware dashboard.
-   Workflow list: create, rename, archive/delete, search, status.
-   Visual workflow editor with draggable nodes and connectable edges.
-   Node configuration panel.
-   Initial node types:
    -   Manual Trigger
    -   Webhook Trigger
    -   HTTP Request
    -   Condition
    -   Delay
    -   Logger / Output
-   Save and load workflow graphs.
-   Validate a workflow before execution.
-   Manual execution.
-   Backend execution engine.
-   Background job processing with Redis and BullMQ.
-   Execution history and execution detail page.
-   Per-node execution results and logs.
-   Basic webhook endpoint to trigger a published workflow.
-   Secure credential storage abstraction (never store secrets in
    workflow JSON).
-   Responsive layouts and useful empty/loading/error states.

### Explicitly defer until the MVP is stable

-   AI workflow generation.
-   Billing and subscriptions.
-   Team invitations and complex RBAC.
-   Marketplace and public template gallery.
-   Hundreds of integrations.
-   Complex branching, loops, parallel execution, and sub-workflows.
-   Multi-region/distributed execution.

Build extension points for these, but do not over-engineer them now.

------------------------------------------------------------------------

## 3. Recommended technology stack

Use current stable compatible versions. Before installing packages,
inspect the existing repository and preserve any working setup.

### Frontend

-   Next.js (App Router)
-   React + TypeScript (strict mode)
-   Tailwind CSS
-   shadcn/ui
-   Lucide icons
-   `@xyflow/react` for the visual workflow canvas
-   Zustand for editor/client state where useful
-   TanStack Query or a consistent server-state strategy for API data
-   React Hook Form + Zod for forms and validation

### Backend

-   NestJS + TypeScript
-   REST API with DTO validation
-   Prisma ORM
-   PostgreSQL
-   Redis + BullMQ for background execution
-   Socket.IO or Server-Sent Events for live execution updates (choose
    one initially; prefer Socket.IO if bidirectional events are needed)
-   Swagger/OpenAPI for API documentation

### Development infrastructure

-   Docker Compose for PostgreSQL and Redis
-   Environment variables with `.env.example`
-   ESLint + Prettier
-   Unit and integration tests
-   Git with small, meaningful commits

### Suggested monorepo layout

``` text
nexora/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── packages/
│   └── shared/              # Shared types/schemas if needed
├── infrastructure/
│   └── docker-compose.yml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEVELOPMENT.md
├── .env.example
├── .gitignore
├── README.md
└── package.json             # Optional workspace root
```

If the repository already has `frontend/` and `backend/`, do not
restructure it just for naming consistency. Keep the existing structure
and document it.

------------------------------------------------------------------------

## 4. Product design and visual identity

### Brand

-   Product name: **NEXORA**
-   Primary tagline: **Automate Beyond Limits.**
-   Supporting line: **Connect your ideas. Orchestrate your workflows.
    Build without boundaries.**
-   Secondary phrase: **Connect. Orchestrate. Automate.**

### Visual direction

Premium, minimal, futuristic, developer-friendly SaaS.

Suggested palette:

  Token           Hex         Usage
  --------------- ----------- --------------------------------
  Midnight Navy   `#101827`   Main dark surfaces
  Deep Slate      `#172D43`   Elevated panels
  Electric Cyan   `#22D3EE`   Primary accent / active states
  Neon Violet     `#8B5CF6`   Secondary accent
  Soft White      `#F8FAFC`   Light surfaces / text
  Slate Grey      `#64748B`   Muted text
  Success Green   `#22C55E`   Success states
  Error Red       `#EF4444`   Error states

Use the palette as design guidance, not as a requirement to make every
screen dark. Implement a coherent dark-first theme with accessible
contrast. Keep spacing, typography, borders, shadows, and radii
consistent.

### Typography

-   UI: Geist or Inter
-   Code / technical labels: JetBrains Mono

### Logo direction

Create a simple geometric mark based on connected workflow nodes and a
central orchestration point. It should work as a favicon, app icon,
sidebar logo, and monochrome mark. Avoid generic robot heads, brains, or
overly complex gradients. If no image-generation or vector-design
capability is available, create a clean SVG logo in the repository.

### UX expectations

-   Desktop-first workflow editor, fully responsive elsewhere.
-   Persistent sidebar navigation.
-   Clear page titles and contextual actions.
-   Consistent button hierarchy.
-   Skeletons for loading, meaningful empty states, inline validation,
    toast feedback, and confirmation dialogs for destructive actions.
-   Keyboard accessibility and visible focus states.
-   Do not use placeholder charts or fabricated analytics. When there is
    no data, show a well-designed empty state.

### Main navigation

1.  Overview
2.  Workflows
3.  Executions
4.  Integrations
5.  Credentials
6.  Templates (can be marked "Coming soon" only if clearly
    non-functional)
7.  Settings

------------------------------------------------------------------------

## 5. Main application pages

### Public / authentication

-   `/login`
-   `/register`
-   `/forgot-password` (can be deferred if the chosen auth setup does
    not support it yet)

### Application

-   `/dashboard` --- overview, recent workflows, recent executions, real
    summary counts.
-   `/workflows` --- searchable workflow list and create action.
-   `/workflows/new` --- create a workflow and open the editor.
-   `/workflows/[workflowId]` --- visual workflow editor.
-   `/executions` --- searchable/filterable execution history.
-   `/executions/[executionId]` --- execution detail, node statuses,
    outputs, and logs.
-   `/integrations` --- available integration types and connection
    state.
-   `/credentials` --- secure credential management.
-   `/settings` --- profile and workspace settings.

Use a consistent authenticated layout and route protection. Do not rely
only on hiding navigation links for security; enforce authorization in
the backend.

------------------------------------------------------------------------

## 6. Workflow data model

Design the model carefully before implementing execution. Keep the graph
definition separate from credentials and execution data.

### Workflow

Suggested fields:

-   `id`
-   `workspaceId`
-   `name`
-   `description` (optional)
-   `status` (`draft`, `active`, `archived`)
-   `definition` (JSON containing nodes and edges)
-   `version`
-   `createdAt`
-   `updatedAt`
-   `publishedAt` (optional)

### Workflow node definition

Each node should have:

-   Stable `id`
-   `type`
-   `position` (`x`, `y`)
-   `data` containing only non-secret configuration
-   Optional display metadata

### Workflow edge definition

Each edge should have:

-   Stable `id`
-   `source`
-   `target`
-   Optional source/target handles
-   Optional edge metadata

### Execution

Suggested fields:

-   `id`
-   `workflowId`
-   `workflowVersion`
-   `workspaceId`
-   `triggerType`
-   `status` (`queued`, `running`, `succeeded`, `failed`, `cancelled`)
-   `startedAt`
-   `finishedAt`
-   `errorSummary` (optional)
-   `createdAt`

### Node execution

Suggested fields:

-   `id`
-   `executionId`
-   `nodeId`
-   `nodeType`
-   `status`
-   `input` (redacted where necessary)
-   `output` (size-limited and redacted)
-   `error` (sanitized)
-   `startedAt`
-   `finishedAt`
-   `durationMs`

### Credentials

Store credentials in a dedicated table/service. Encrypt secret values at
rest using an application encryption key supplied through environment
configuration. Never put plaintext secrets in workflow definitions,
browser storage, logs, or API responses.

Use workspace ownership on every relevant query. Add database indexes
for common workspace, workflow, and execution lookups.

------------------------------------------------------------------------

## 7. Workflow execution design

The workflow engine is the core of Nexora. Keep it separate from
controllers and UI components.

### Initial execution model

1.  User saves a workflow definition.
2.  Backend validates the graph and node configuration.
3.  User clicks **Run**.
4.  Backend creates an execution record with status `queued`.
5.  Backend enqueues an execution job in BullMQ.
6.  Worker loads the immutable workflow version/definition for that run.
7.  Worker resolves nodes in dependency order.
8.  Each node handler receives a controlled execution context and prior
    outputs.
9.  Worker persists node status, output, duration, and sanitized errors.
10. Execution is marked `succeeded` or `failed`.
11. Frontend receives updates and refreshes execution details.

### Initial node behavior

-   **Manual Trigger:** starts an execution and supplies optional test
    input.
-   **Webhook Trigger:** receives a validated HTTP request and starts an
    execution.
-   **HTTP Request:** sends an HTTP request using configured method,
    URL, headers, query, and body. Support credential references,
    timeouts, and response-size limits.
-   **Condition:** evaluates a small, documented set of safe operators
    against input/output values. Do not use `eval` or execute arbitrary
    user-supplied JavaScript.
-   **Delay:** waits for a configured duration within safe limits.
    Prefer a queue-aware delay mechanism rather than blocking a worker
    thread.
-   **Logger / Output:** records a sanitized value for inspection.

### MVP execution constraints

-   Start with a directed acyclic graph (DAG).
-   Detect cycles and reject invalid graphs.
-   Execute nodes in topological order.
-   Support one incoming dependency path per node initially, or
    explicitly define how multiple inputs are merged.
-   Set execution and HTTP timeouts.
-   Limit payload and output sizes.
-   Add retry behavior only with explicit limits and clear retry
    semantics.
-   Make execution idempotency and duplicate webhook handling part of
    the design.
-   Do not run arbitrary code or shell commands.
-   Do not expose internal stack traces or secrets to end users.

------------------------------------------------------------------------

## 8. API outline

Use versioned REST routes, for example `/api/v1`.

### Authentication

-   `POST /auth/register`
-   `POST /auth/login`
-   `POST /auth/logout`
-   `GET /auth/me`

### Workflows

-   `GET /workflows`
-   `POST /workflows`
-   `GET /workflows/:id`
-   `PATCH /workflows/:id`
-   `DELETE /workflows/:id`
-   `POST /workflows/:id/validate`
-   `POST /workflows/:id/run`
-   `POST /workflows/:id/publish`
-   `POST /workflows/:id/unpublish`

### Executions

-   `GET /executions`
-   `GET /executions/:id`
-   `GET /executions/:id/nodes`
-   `POST /executions/:id/cancel` (implement only if cancellation is
    safely supported)

### Webhooks

-   `POST /webhooks/:publicWorkflowToken`

Webhook tokens must be unguessable, stored securely (prefer hashed
tokens), revocable, and rate-limited. Validate request size and content
type.

### Credentials

-   `GET /credentials`
-   `POST /credentials`
-   `PATCH /credentials/:id`
-   `DELETE /credentials/:id`

Never return decrypted credential values after creation.

Document request/response DTOs and error formats in Swagger.

------------------------------------------------------------------------

## 9. Security and reliability requirements

-   Validate all incoming DTOs on the backend.
-   Enforce authentication and workspace-level authorization
    server-side.
-   Use secure password hashing through a maintained auth library.
-   Configure CORS explicitly.
-   Apply rate limits to authentication, webhook, and execution
    endpoints.
-   Encrypt credentials at rest; keep encryption keys outside source
    control.
-   Redact authorization headers, API keys, passwords, and tokens from
    logs.
-   Set HTTP request timeouts and response-size limits.
-   Prevent SSRF in HTTP Request nodes: block loopback, link-local,
    private network, and cloud metadata destinations unless a deliberate
    safe allowlist policy is implemented. Re-check resolved IPs to
    reduce DNS-rebinding risk.
-   Do not allow arbitrary JavaScript, shell, SQL, or filesystem
    execution.
-   Use safe error messages in production.
-   Add database migrations and backups guidance.
-   Keep dependencies updated and avoid abandoned packages.

------------------------------------------------------------------------

## 10. Step-by-step implementation roadmap

Work through one phase at a time. At the end of every phase, run checks
and report what is complete before proceeding.

### Phase 0 --- Repository inspection and plan

Tasks: - Inspect all existing files, package managers, scripts, and Git
status. - Identify whether the repo is empty or already initialized. -
Do not overwrite or delete existing work. - Create
`docs/IMPLEMENTATION_PLAN.md` and `docs/ARCHITECTURE.md`. - Confirm the
selected monorepo structure and package manager.

Acceptance criteria: - Existing repository is understood. - Proposed
architecture and phases are documented. - No existing user work has been
destroyed.

### Phase 1 --- Foundation and local infrastructure

Tasks: - Set up frontend and backend applications. - Configure
TypeScript strict mode, linting, formatting, and environment
validation. - Add Docker Compose for PostgreSQL and Redis. - Add Prisma
and the first database migration. - Add health-check endpoints. - Create
`.env.example` with placeholders only.

Acceptance criteria: - Frontend starts locally. - Backend starts
locally. - PostgreSQL and Redis are healthy. - Prisma can connect and
migrate. - No secrets are committed.

### Phase 2 --- Design system and application shell

Tasks: - Implement Nexora theme, typography, logo, and reusable
components. - Build responsive sidebar and top bar. - Create dashboard,
workflow list, executions, integrations, credentials, and settings page
shells. - Add loading, empty, error, and not-found states.

Acceptance criteria: - Navigation works. - Layout is responsive. -
Components use consistent design tokens. - Empty states are honest and
useful.

### Phase 3 --- Authentication and workspace foundation

Tasks: - Implement registration, login, logout, and current-user
endpoint. - Add workspace and membership model, even if MVP initially
creates one default workspace per user. - Protect frontend routes. -
Enforce backend ownership and workspace authorization.

Acceptance criteria: - Unauthenticated users cannot access protected
APIs/pages. - Users cannot access another workspace's records. -
Authentication errors are handled cleanly.

### Phase 4 --- Workflow CRUD and graph persistence

Tasks: - Create workflow database model and APIs. - Build workflow list,
create, rename, archive/delete. - Add editor route with React Flow. -
Implement node palette, canvas, connection creation, node selection, and
configuration panel. - Save and load nodes/edges. - Add unsaved-change
handling.

Acceptance criteria: - A user can create a workflow, add nodes, connect
them, save, refresh, and reopen with the same graph. - Workflow
definitions contain no plaintext secrets.

### Phase 5 --- Validation and first execution vertical slice

Tasks: - Implement graph validation and cycle detection. - Implement
execution and node-execution persistence. - Add manual trigger and
Logger/Output node first. - Add BullMQ queue and worker. - Run a
workflow from the UI and display actual execution state and outputs.

Acceptance criteria: - A simple Manual Trigger → Logger workflow
executes on the backend. - Execution history is persisted. - Failed
executions show sanitized errors. - UI never fabricates execution
success.

### Phase 6 --- HTTP Request and Condition nodes

Tasks: - Implement HTTP Request configuration and backend handler. - Add
request timeout, payload limits, safe URL validation, and secret
redaction. - Implement safe Condition operators. - Add test-input
experience and per-node results.

Acceptance criteria: - A workflow can make a safe HTTP request and
branch/continue based on supported condition rules. - Invalid
configuration is caught before execution. - Secrets never appear in logs
or frontend responses.

### Phase 7 --- Webhooks, publishing, and live monitoring

Tasks: - Add workflow publish/unpublish lifecycle. - Create secure
webhook trigger tokens. - Add webhook rate limiting and request
validation. - Add live execution updates with Socket.IO or SSE. - Build
execution detail timeline and filters.

Acceptance criteria: - A published workflow can be triggered by a
webhook. - Duplicate/invalid requests are handled safely. - UI shows
persisted, real-time execution state.

### Phase 8 --- Credentials and integrations foundation

Tasks: - Build encrypted credential service and CRUD. - Add credential
references to HTTP Request nodes. - Add a small initial integration
catalogue, but only show integrations that actually work. - Add
connection test where supported.

Acceptance criteria: - Secrets are encrypted at rest. - Secret values
are write-only after creation. - Integration status reflects real
connection state.

### Phase 9 --- Testing, hardening, and deployment

Tasks: - Add unit tests for graph validation and node handlers. - Add
integration tests for APIs, database, and queue. - Add end-to-end test
for create → save → run → inspect. - Add logging, request IDs, rate
limiting, and production configuration. - Add Dockerfiles and deployment
documentation. - Add CI checks.

Acceptance criteria: - Critical workflow path passes automated tests. -
Fresh environment can be set up using documented steps. - Production
build succeeds. - No secrets or sensitive payloads are logged.

### Phase 10 --- Post-MVP enhancements

Only after MVP acceptance: - AI-assisted workflow generation from
natural language. - Workflow templates. - Retry policies and scheduled
triggers. - Parallel branches and advanced DAG execution. - Team
invitations and roles. - Usage analytics and billing. - More
integrations and a public integration SDK.

------------------------------------------------------------------------

## 11. Testing strategy

At minimum, cover:

-   Graph validation: missing nodes, dangling edges, cycles, unsupported
    node types.
-   Workflow authorization: cross-workspace access is rejected.
-   Credential security: secrets are not returned or logged.
-   Execution: success, node failure, timeout, retry behavior (when
    implemented).
-   Webhooks: invalid token, oversized body, rate limit, duplicate
    request.
-   HTTP node: blocked private IP destinations, timeout, invalid URL,
    large response.
-   UI: create/edit/save/reopen workflow; run and inspect execution.

Use real backend responses in the UI. Mock data is acceptable only for
isolated visual development and must be clearly separated from
production behavior.

------------------------------------------------------------------------

## 12. Environment variables

Create `.env.example` with documented placeholders such as:

``` env
NODE_ENV=development

# API
API_PORT=4000
API_BASE_URL=http://localhost:4000

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Database
DATABASE_URL=postgresql://nexora:nexora_dev_password@localhost:5432/nexora?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
AUTH_SECRET=replace-with-a-long-random-secret

# Credential encryption
CREDENTIAL_ENCRYPTION_KEY=replace-with-a-32-byte-key
```

Adjust names to the chosen auth library and actual implementation.
`.env.example` must contain no real production secrets. Add `.env` to
`.gitignore`.

------------------------------------------------------------------------

## 13. Antigravity AI master prompt

Copy the following prompt into Antigravity AI after opening the Nexora
repository.

------------------------------------------------------------------------

### MASTER PROMPT --- BUILD NEXORA

You are acting as a senior product engineer, software architect, UI/UX
designer, and QA engineer. Your task is to build **NEXORA**, a premium
developer-first visual workflow automation SaaS.

Read this entire `NEXORA_BUILD_BLUEPRINT.md` before making changes.
Treat it as the product source of truth.

#### Your responsibilities

1.  Inspect the current repository before changing anything.
2.  Preserve existing work and avoid unnecessary rewrites.
3.  Build production-minded, maintainable code with clear module
    boundaries.
4.  Use TypeScript strict mode and validate data at system boundaries.
5.  Follow the stack and architecture in this document unless the
    repository has a valid existing choice. If you need to deviate,
    explain why and update the documentation.
6.  Implement one phase at a time. Do not attempt the entire product in
    one giant code-generation pass.
7.  Do not leave core features as fake buttons, static mockups, or
    hardcoded success states.
8.  Never fabricate dashboard metrics, execution history, integration
    status, or API results.
9.  Keep secrets out of source code, workflow JSON, browser storage, API
    responses, and logs.
10. Do not use `eval`, arbitrary user JavaScript execution, shell
    execution, or unsafe dynamic code execution for workflow nodes.
11. Add tests for critical logic and run relevant checks after each
    phase.
12. Keep the UI polished, responsive, accessible, and consistent with
    Nexora's premium visual identity.

#### Required working method

**Step A --- Inspect** - List the repository structure and inspect
existing package files. - Check Git status and identify uncommitted
changes. - Identify the current framework, package manager, and
installed dependencies. - Do not delete or overwrite files without a
clear reason.

**Step B --- Plan** - Create or update `docs/IMPLEMENTATION_PLAN.md`. -
Create or update `docs/ARCHITECTURE.md`. - Break the current phase into
small tasks. - Identify risks, dependencies, and acceptance criteria.

**Step C --- Implement** - Implement only the current phase. - Prefer
complete, working vertical slices over disconnected scaffolding. - Keep
frontend and backend contracts aligned. - Add validation, error
handling, loading states, and empty states. - Use reusable components
and consistent naming. - Update `.env.example` whenever a new
environment variable is introduced.

**Step D --- Verify** - Run formatter and lint checks. - Run TypeScript
checks. - Run relevant unit/integration tests. - Run production builds
where practical. - Fix issues caused by your changes before declaring
the phase complete. - If a check cannot run, explain exactly why; do not
claim it passed.

**Step E --- Report** At the end of each phase, provide: - What was
implemented. - Important files created or changed. - Commands to run the
project. - Environment variables or migrations required. - Tests/checks
run and their actual results. - Known limitations and remaining tasks. -
The next phase you recommend.

Then stop and wait for approval before moving to the next phase.

#### Product-specific requirements

-   Brand name: NEXORA.
-   Tagline: Automate Beyond Limits.
-   Supporting line: Connect. Orchestrate. Automate.
-   Visual style: premium, minimal, futuristic, developer-friendly.
-   Use Midnight Navy `#101827`, Deep Slate `#172D43`, Electric Cyan
    `#22D3EE`, Neon Violet `#8B5CF6`, Soft White `#F8FAFC`, and Slate
    Grey `#64748B` as design tokens.
-   Use Geist or Inter for UI and JetBrains Mono for code labels.
-   Create a geometric connected-node logo suitable for favicon and app
    icon.
-   Use `@xyflow/react` for the workflow editor.
-   The backend is the source of truth for workflow execution.
-   Persist workflow definitions and execution results in PostgreSQL.
-   Use Redis and BullMQ for asynchronous execution.
-   Begin with a safe DAG executor and the initial node types defined in
    this blueprint.
-   Store credentials separately and encrypted at rest.
-   Enforce workspace authorization on every protected backend resource.
-   Document API endpoints and setup steps.

#### First task --- do this now

Start with **Phase 0: Repository inspection and plan** only.

Do not begin implementing all phases. Inspect the repository, report
what already exists, identify any conflicts with this blueprint, and
create/update the implementation and architecture documents. Then
propose the exact Phase 1 tasks and wait for my approval.

Your goal is not merely to make Nexora look impressive. Your goal is to
build a real, secure, testable workflow automation product that can grow
into a production SaaS.

------------------------------------------------------------------------

## 14. How to use this document

1.  Save this file in the root of your Nexora repository as
    `NEXORA_BUILD_BLUEPRINT.md`.
2.  Open the repository folder in Antigravity AI.
3.  Ask Antigravity to read `NEXORA_BUILD_BLUEPRINT.md` and follow its
    master prompt.
4.  Let it complete Phase 0 and review the plan.
5.  Approve Phase 1 only after you understand the proposed structure.
6.  Continue phase by phase. Keep this blueprint in the repository as
    the shared reference.

### Suggested first message to Antigravity

> Read `NEXORA_BUILD_BLUEPRINT.md` completely. Follow the Master Prompt
> in Section 13. Start with Phase 0 only: inspect my existing
> repository, preserve all current work, create/update the
> implementation plan and architecture documents, and report the exact
> Phase 1 plan. Do not start Phase 1 until I approve it.

------------------------------------------------------------------------

**NEXORA --- Automate Beyond Limits.**
