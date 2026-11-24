# NEXORA — API Specification & Integration Reference

**Base URL:** `http://localhost:4000/api/v1`  
**Interactive OpenAPI UI:** `http://localhost:4000/docs`

---

## 1. Authentication Endpoints

### Register User & Workspace
Creates user account, auto-provisions a default workspace, and sets user role to `OWNER`.
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "sarah@nexora.dev",
  "password": "SecurePassword123!",
  "fullName": "Sarah Connor"
}
```
**Response (201 Created):**
```json
{
  "user": {
    "id": "u-uuid-1234",
    "email": "sarah@nexora.dev",
    "fullName": "Sarah Connor"
  },
  "workspace": {
    "id": "ws-uuid-5678",
    "name": "Sarah Connor's Workspace",
    "slug": "sarah-connors-workspace"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Log In
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "sarah@nexora.dev",
  "password": "SecurePassword123!"
}
```
**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": { ... },
  "workspaces": [ ... ]
}
```

---

## 2. Workflows Endpoints

All workflow requests require authentication headers:
- `Authorization: Bearer <TOKEN>`
- `x-workspace-id: <WORKSPACE_ID>`

### List Workflows
```http
GET /api/v1/workflows?search=lead&status=ACTIVE
```

### Create Workflow
```http
POST /api/v1/workflows
Content-Type: application/json

{
  "name": "Lead Intake & Notification",
  "description": "Processes inbound webhooks, evaluates company size, and notifies Slack"
}
```

### Save / Update Workflow Definition
Increments current version and stores immutable version snapshot.
```http
PATCH /api/v1/workflows/:id
Content-Type: application/json

{
  "definition": {
    "nodes": [ ... ],
    "edges": [ ... ]
  }
}
```

### Validate Workflow DAG
Executes Kahn's algorithm, detects cycles, and calculates execution order without running.
```http
POST /api/v1/workflows/:id/validate
```

### Publish Workflow
Generates secure 32-byte webhook token, saves SHA-256 hash, and sets status to `ACTIVE`.
```http
POST /api/v1/workflows/:id/publish
```
**Response (200 OK):**
```json
{
  "workflowId": "wf-uuid-1234",
  "status": "ACTIVE",
  "token": "7a8b9c...32bytes",
  "webhookPath": "/api/v1/webhooks/7a8b9c...32bytes",
  "publishedAt": "2026-11-24T10:00:00.000Z"
}
```

### Unpublish Workflow
Deactivates webhook and reverts status to `DRAFT`.
```http
POST /api/v1/workflows/:id/unpublish
```

---

## 3. Webhook Inbound Gateway

### Trigger Published Workflow via Webhook
Public endpoint. No authentication required.
```http
POST /api/v1/webhooks/:token
Content-Type: application/json

{
  "event": "customer.created",
  "email": "dev@enterprise.com",
  "tier": "enterprise"
}
```
**Response (202 Accepted):**
```json
{
  "success": true,
  "executionId": "exec-uuid-9876",
  "status": "QUEUED",
  "workflowId": "wf-uuid-1234",
  "message": "Workflow execution triggered via webhook successfully"
}
```

---

## 4. Execution History Endpoints

### List Workspace Executions
```http
GET /api/v1/executions?workflowId=:id&status=SUCCEEDED
```

### Get Execution Details with Step Outputs
```http
GET /api/v1/executions/:id
```
**Response (200 OK):**
```json
{
  "id": "exec-uuid-9876",
  "workflowId": "wf-uuid-1234",
  "status": "SUCCEEDED",
  "durationMs": 420,
  "nodeExecutions": [
    {
      "nodeId": "webhook_1",
      "nodeType": "webhook-trigger",
      "status": "SUCCEEDED",
      "durationMs": 5,
      "outputData": { "body": { "event": "customer.created" } }
    },
    {
      "nodeId": "condition_1",
      "nodeType": "condition",
      "status": "SUCCEEDED",
      "durationMs": 2,
      "outputData": { "branch": "true", "result": true }
    }
  ]
}
```

---

## 5. Credentials Vault Endpoints

### Vault a New Secret (AES-256-GCM)
```http
POST /api/v1/credentials
Content-Type: application/json

{
  "name": "STRIPE_SECRET_KEY",
  "type": "API_KEY",
  "value": "sk_live_51M0..."
}
```
**Response (201 Created):**
```json
{
  "id": "cred-uuid-1111",
  "name": "STRIPE_SECRET_KEY",
  "type": "API_KEY",
  "maskedPreview": "sk_••••••••",
  "createdAt": "2026-11-24T10:00:00.000Z"
}
```

### List Vault Credentials (Secrets Masked)
```http
GET /api/v1/credentials
```

### Delete Credential
```http
DELETE /api/v1/credentials/:id
```

---

## 6. Health & Readiness

```http
GET /api/v1/health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-11-24T10:00:00.000Z",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```
