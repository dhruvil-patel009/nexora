import { describe, it, expect } from 'vitest';
import { ValidatorService } from '../../apps/api/src/modules/engine/validator.service';
import { WorkflowGraphDefinition } from '../../packages/shared/src';

describe('ValidatorService - Kahn\'s DAG & Cycle Detection', () => {
  const validator = new ValidatorService();

  it('rejects an empty workflow definition with zero nodes', () => {
    const result = validator.validateGraph({ nodes: [], edges: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Workflow graph must contain at least one node.');
  });

  it('rejects a graph without any trigger node', () => {
    const definition: WorkflowGraphDefinition = {
      nodes: [
        { id: 'logger-1', type: 'logger', position: { x: 0, y: 0 }, data: { label: 'Logger' } },
      ],
      edges: [],
    };
    const result = validator.validateGraph(definition);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Workflow graph must contain at least one trigger node');
  });

  it('detects missing node referenced in edge source', () => {
    const definition: WorkflowGraphDefinition = {
      nodes: [
        { id: 't-1', type: 'manual-trigger', position: { x: 0, y: 0 }, data: { label: 'Start' } },
      ],
      edges: [
        { id: 'e-1', source: 'non-existent-node', target: 't-1' },
      ],
    };
    const result = validator.validateGraph(definition);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Edge references missing source node: "non-existent-node"');
  });

  it('detects missing node referenced in edge target', () => {
    const definition: WorkflowGraphDefinition = {
      nodes: [
        { id: 't-1', type: 'manual-trigger', position: { x: 0, y: 0 }, data: { label: 'Start' } },
      ],
      edges: [
        { id: 'e-1', source: 't-1', target: 'ghost-target' },
      ],
    };
    const result = validator.validateGraph(definition);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Edge references missing target node: "ghost-target"');
  });

  it('successfully validates a valid linear DAG and returns topological order', () => {
    const definition: WorkflowGraphDefinition = {
      nodes: [
        { id: 'n-trigger', type: 'manual-trigger', position: { x: 0, y: 0 }, data: { label: 'Trigger' } },
        { id: 'n-http', type: 'http-request', position: { x: 0, y: 100 }, data: { label: 'HTTP' } },
        { id: 'n-log', type: 'logger', position: { x: 0, y: 200 }, data: { label: 'Log' } },
      ],
      edges: [
        { id: 'e1', source: 'n-trigger', target: 'n-http' },
        { id: 'e2', source: 'n-http', target: 'n-log' },
      ],
    };
    const result = validator.validateGraph(definition);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.executionOrder).toEqual(['n-trigger', 'n-http', 'n-log']);
  });

  it('detects a circular dependency (cycle) and rejects execution', () => {
    // Cycle: Trigger -> NodeA -> NodeB -> NodeA
    const definition: WorkflowGraphDefinition = {
      nodes: [
        { id: 'trigger', type: 'manual-trigger', position: { x: 0, y: 0 }, data: { label: 'Trigger' } },
        { id: 'node-a', type: 'http-request', position: { x: 0, y: 100 }, data: { label: 'Node A' } },
        { id: 'node-b', type: 'condition', position: { x: 0, y: 200 }, data: { label: 'Node B' } },
      ],
      edges: [
        { id: 'e1', source: 'trigger', target: 'node-a' },
        { id: 'e2', source: 'node-a', target: 'node-b' },
        { id: 'e3', source: 'node-b', target: 'node-a' }, // Back edge creating cycle
      ],
    };
    const result = validator.validateGraph(definition);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Circular dependency / cycle detected');
    expect(result.errors[0]).toContain('Directed Acyclic Graph (DAG)');
  });
});
