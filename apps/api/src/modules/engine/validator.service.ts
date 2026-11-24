import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkflowGraphDefinition, WorkflowNode, WorkflowEdge } from '@nexora/shared';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  executionOrder?: string[];
}

@Injectable()
export class ValidatorService {
  validateGraph(definition: WorkflowGraphDefinition): ValidationResult {
    const errors: string[] = [];
    const nodes = (definition?.nodes || []) as WorkflowNode[];
    const edges = (definition?.edges || []) as WorkflowEdge[];

    if (!nodes || nodes.length === 0) {
      return {
        isValid: false,
        errors: ['Workflow graph must contain at least one node.'],
      };
    }

    // 1. Verify existence of at least one trigger node
    const triggerNodes = nodes.filter(
      (n) => n.type === 'manual-trigger' || n.type === 'webhook-trigger',
    );
    if (triggerNodes.length === 0) {
      errors.push('Workflow graph must contain at least one trigger node (Manual Trigger or Webhook Trigger).');
    }

    // 2. Verify all edge sources and targets exist
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const edge of edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references missing source node: "${edge.source}"`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references missing target node: "${edge.target}"`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // 3. Cycle Detection & Topological Sort via Kahn's Algorithm
    const inDegree: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    for (const node of nodes) {
      inDegree[node.id] = 0;
      adjacency[node.id] = [];
    }

    for (const edge of edges) {
      adjacency[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }

    // Queue nodes with in-degree 0 (triggers and independent roots)
    const queue: string[] = [];
    for (const nodeId of nodes.map((n) => n.id)) {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    }

    const executionOrder: string[] = [];

    while (queue.length > 0) {
      const u = queue.shift()!;
      executionOrder.push(u);

      for (const v of adjacency[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    // If processed nodes count does not equal total nodes, a cycle exists
    if (executionOrder.length !== nodes.length) {
      const cycleNodes = nodes
        .filter((n) => inDegree[n.id] > 0)
        .map((n) => n.data?.label || n.id);

      return {
        isValid: false,
        errors: [
          `Circular dependency / cycle detected involving nodes: ${cycleNodes.join(', ')}. Nexora requires a Directed Acyclic Graph (DAG).`,
        ],
      };
    }

    return {
      isValid: true,
      errors: [],
      executionOrder,
    };
  }
}
