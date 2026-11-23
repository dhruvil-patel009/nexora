/**
 * NEXORA Shared Domain Types & Contracts
 * Brand: NEXORA | Automate Beyond Limits.
 */

// Workflow Enums & Types
export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type NodeType =
  | 'manual-trigger'
  | 'webhook-trigger'
  | 'http-request'
  | 'condition'
  | 'delay'
  | 'logger';

export interface WorkflowNodeData {
  label: string;
  description?: string;
  config: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface WorkflowGraphDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

// Execution Enums & Types
export type ExecutionStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type NodeExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SKIPPED';
export type TriggerType = 'MANUAL' | 'WEBHOOK' | 'SCHEDULE';

export interface ExecutionSummary {
  id: string;
  workflowId: string;
  workflowVersion: number;
  workspaceId: string;
  triggerType: TriggerType;
  status: ExecutionStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  errorSummary?: string | null;
  createdAt: string;
}

export interface NodeExecutionDetail {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: NodeType;
  status: NodeExecutionStatus;
  inputData?: Record<string, unknown> | null;
  outputData?: Record<string, unknown> | null;
  errorMessage?: string | null;
  durationMs?: number | null;
  startedAt?: string | null;
  finishedAt?: string | null;
}

// Credentials Enums & Types
export type CredentialType = 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'CUSTOM_HEADER';

export interface CredentialSummary {
  id: string;
  workspaceId: string;
  name: string;
  type: CredentialType;
  maskedPreview: string;
  createdAt: string;
  updatedAt: string;
}

// Health Check Contract
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: { status: 'up' | 'down'; latencyMs?: number };
    redis: { status: 'up' | 'down'; latencyMs?: number };
  };
}
