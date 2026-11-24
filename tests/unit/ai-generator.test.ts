import { describe, it, expect } from 'vitest';
import { AiWorkflowGeneratorService } from '../../apps/api/src/modules/workflows/ai-workflow-generator.service';
import { ValidatorService } from '../../apps/api/src/modules/engine/validator.service';

describe('AiWorkflowGeneratorService - Natural Language to DAG', () => {
  const validator = new ValidatorService();
  const generator = new AiWorkflowGeneratorService(validator);

  it('generates a valid DAG from a webhook + condition + notification prompt', () => {
    const prompt = 'When an inbound webhook arrives, if score is greater than 90 notify Slack, otherwise log it';
    const result = generator.generateFromPrompt(prompt);

    expect(result.name).toBeDefined();
    expect(result.definition.nodes.length).toBeGreaterThanOrEqual(3);
    expect(result.definition.edges.length).toBeGreaterThanOrEqual(2);

    // Verify the generated graph passes Kahn's algorithm
    const validation = validator.validateGraph(result.definition);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Check trigger is webhook
    const triggerNode = result.definition.nodes.find((n) => n.type === 'webhook-trigger');
    expect(triggerNode).toBeDefined();

    // Check condition node is present
    const conditionNode = result.definition.nodes.find((n) => n.type === 'condition');
    expect(conditionNode).toBeDefined();
    expect(conditionNode?.data?.config?.operator).toBe('greater_than');
  });

  it('generates a linear pipeline from a manual trigger and delay prompt', () => {
    const prompt = 'Wait 10 seconds and post an HTTP request to api.example.com';
    const result = generator.generateFromPrompt(prompt);

    const validation = validator.validateGraph(result.definition);
    expect(validation.isValid).toBe(true);

    const delayNode = result.definition.nodes.find((n) => n.type === 'delay');
    expect(delayNode).toBeDefined();
    expect(delayNode?.data?.config?.durationSeconds).toBe(10);
  });
});
