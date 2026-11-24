import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { ValidatorService } from '../../apps/api/src/modules/engine/validator.service';
import { ConditionHandler } from '../../apps/api/src/modules/engine/node-handlers/condition.handler';
import { HttpRequestHandler } from '../../apps/api/src/modules/engine/node-handlers/http-request.handler';
import { EncryptionService } from '../../apps/api/src/modules/credentials/encryption.service';
import { WorkflowGraphDefinition } from '../../packages/shared/src';

describe('Integration Test: Critical Workflow Execution Path', () => {
  const validator = new ValidatorService();

  it('validates a complete branching workflow with Webhook Trigger, Condition, HTTP and Logger', () => {
    const graph: WorkflowGraphDefinition = {
      nodes: [
        {
          id: 'node-webhook',
          type: 'webhook-trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Inbound Webhook' },
        },
        {
          id: 'node-condition',
          type: 'condition',
          position: { x: 0, y: 100 },
          data: {
            label: 'Check Tier',
            config: { variable: 'trigger.tier', operator: 'equals', value: 'enterprise' },
          },
        },
        {
          id: 'node-http',
          type: 'http-request',
          position: { x: -100, y: 200 },
          data: {
            label: 'Notify CRM',
            config: {
              method: 'POST',
              url: 'https://api.example.com/leads',
              headers: { Authorization: 'Bearer {{credentials.CRM_API_KEY}}' },
            },
          },
        },
        {
          id: 'node-log-free',
          type: 'logger',
          position: { x: 100, y: 200 },
          data: {
            label: 'Log Standard Lead',
            config: { message: 'Processed standard tier lead: {{trigger.email}}' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-webhook', target: 'node-condition' },
        { id: 'e2', source: 'node-condition', target: 'node-http', sourceHandle: 'true' },
        { id: 'e3', source: 'node-condition', target: 'node-log-free', sourceHandle: 'false' },
      ],
    };

    const validation = validator.validateGraph(graph);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.executionOrder).toBeDefined();
    expect(validation.executionOrder![0]).toBe('node-webhook');
    expect(validation.executionOrder![1]).toBe('node-condition');
  });

  it('generates secure 32-byte webhook token and matches SHA-256 hash', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    expect(rawToken).toHaveLength(64);

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(tokenHash).toHaveLength(64);

    // Verify lookup identity
    const lookupHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(lookupHash).toBe(tokenHash);
  });

  it('simulates inbound webhook execution context through Condition evaluation', () => {
    const inboundPayload = {
      body: {
        event: 'signup',
        email: 'alex@enterprise.com',
        tier: 'enterprise',
      },
      headers: { 'content-type': 'application/json' },
      query: {},
    };

    const executionContext = {
      trigger: inboundPayload.body,
      $trigger: inboundPayload,
      steps: {},
    };

    // Evaluate Condition node
    const conditionOutput = ConditionHandler.evaluate(
      { variable: 'trigger.tier', operator: 'equals', value: 'enterprise' },
      executionContext,
    );

    expect(conditionOutput.result).toBe(true);
    expect(conditionOutput.branch).toBe('true');
  });

  it('resolves encrypted vaulted credential in HTTP Request headers and body', () => {
    const rawSecret = 'crm_live_super_secret_token_999';
    const encrypted = EncryptionService.encrypt(rawSecret);

    // Decrypt in memory (as the worker does)
    const decryptedMap: Record<string, string> = {
      CRM_API_KEY: EncryptionService.decrypt(encrypted.encryptedData, encrypted.iv, encrypted.authTag),
    };

    expect(decryptedMap.CRM_API_KEY).toBe(rawSecret);

    // Interpolate headers
    const rawHeaderTemplate = 'Bearer {{credentials.CRM_API_KEY}}';
    const interpolatedHeader = HttpRequestHandler.interpolate(rawHeaderTemplate, {}, decryptedMap);
    expect(interpolatedHeader).toBe(`Bearer ${rawSecret}`);

    // Context interpolation for logger
    const logTemplate = 'New enterprise customer: {{trigger.email}}';
    const context = { trigger: { email: 'sarah@nexora.dev' } };
    const interpolatedLog = HttpRequestHandler.interpolate(logTemplate, context);
    expect(interpolatedLog).toBe('New enterprise customer: sarah@nexora.dev');
  });
});
