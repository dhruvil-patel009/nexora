import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ValidatorService } from '../engine/validator.service';
import { WorkflowGraphDefinition, WorkflowNode, WorkflowEdge } from '@nexora/shared';

export interface AiGenerationResult {
  name: string;
  description: string;
  definition: WorkflowGraphDefinition;
  summary: string;
}

@Injectable()
export class AiWorkflowGeneratorService {
  private readonly logger = new Logger(AiWorkflowGeneratorService.name);

  constructor(private readonly validator: ValidatorService) {}

  generateFromPrompt(prompt: string): AiGenerationResult {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      throw new BadRequestException('Prompt must be at least 5 characters long.');
    }

    const text = prompt.toLowerCase();
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];

    let currentY = 100;
    const centerX = 350;

    // 1. Determine Trigger Node
    const hasWebhookKeyword =
      text.includes('webhook') ||
      text.includes('inbound') ||
      text.includes('receive') ||
      text.includes('incoming') ||
      text.includes('payload') ||
      text.includes('event');

    const triggerId = hasWebhookKeyword ? 'webhook_trigger_1' : 'manual_trigger_1';
    const triggerType = hasWebhookKeyword ? 'webhook-trigger' : 'manual-trigger';
    const triggerLabel = hasWebhookKeyword ? 'Inbound Webhook' : 'Manual Trigger';

    nodes.push({
      id: triggerId,
      type: triggerType,
      position: { x: centerX, y: currentY },
      data: {
        label: triggerLabel,
        description: hasWebhookKeyword ? 'Listens for external HTTP POST' : 'Manual execution trigger',
        config: {},
      },
    });

    let previousNodeId = triggerId;
    currentY += 130;

    // 2. Check for Delay Node
    if (text.includes('delay') || text.includes('wait') || text.includes('pause')) {
      const delayId = `delay_${Date.now().toString(36).slice(-4)}`;
      let seconds = 5;
      const secMatch = text.match(/(\d+)\s*(?:sec|second)/);
      if (secMatch) seconds = Math.min(parseInt(secMatch[1], 10), 30);

      nodes.push({
        id: delayId,
        type: 'delay',
        position: { x: centerX, y: currentY },
        data: {
          label: `Wait ${seconds}s`,
          config: { durationSeconds: seconds },
        },
      });

      edges.push({
        id: `edge_${previousNodeId}_to_${delayId}`,
        source: previousNodeId,
        target: delayId,
        animated: true,
      });

      previousNodeId = delayId;
      currentY += 130;
    }

    // 3. Check for Conditional Logic
    const hasConditionKeyword =
      text.includes('if') ||
      text.includes('condition') ||
      text.includes('check') ||
      text.includes('score') ||
      text.includes('tier') ||
      text.includes('greater than') ||
      text.includes('equals') ||
      text.includes('when');

    if (hasConditionKeyword) {
      const condId = `condition_${Date.now().toString(36).slice(-4)}`;
      let variable = 'trigger.score';
      let operator: any = 'greater_than';
      let value = '80';

      if (text.includes('tier') || text.includes('enterprise') || text.includes('vip')) {
        variable = 'trigger.tier';
        operator = 'equals';
        value = 'enterprise';
      } else if (text.includes('status') || text.includes('active')) {
        variable = 'trigger.status';
        operator = 'equals';
        value = 'active';
      } else if (text.includes('greater than') || text.includes('>')) {
        const numMatch = text.match(/(?:greater than|>)\s*(\d+)/);
        if (numMatch) value = numMatch[1];
      }

      nodes.push({
        id: condId,
        type: 'condition',
        position: { x: centerX, y: currentY },
        data: {
          label: `Check: ${variable}`,
          config: { variable, operator, value },
        },
      });

      edges.push({
        id: `edge_${previousNodeId}_to_${condId}`,
        source: previousNodeId,
        target: condId,
        animated: true,
      });

      currentY += 140;

      // True Branch: Action Node
      const trueActionId = `http_true_${Date.now().toString(36).slice(-4)}`;
      nodes.push({
        id: trueActionId,
        type: 'http-request',
        position: { x: centerX - 180, y: currentY },
        data: {
          label: 'Notify Target API (True)',
          config: {
            method: 'POST',
            url: 'https://api.example.com/notifications',
            headers: { 'Content-Type': 'application/json' },
            body: { event: 'condition_met', data: '{{trigger}}' },
          },
        },
      });

      edges.push({
        id: `edge_${condId}_true_${trueActionId}`,
        source: condId,
        target: trueActionId,
        sourceHandle: 'true',
        animated: true,
        style: { stroke: '#22C55E' },
      });

      // False Branch: Logger Node
      const falseActionId = `logger_false_${Date.now().toString(36).slice(-4)}`;
      nodes.push({
        id: falseActionId,
        type: 'logger',
        position: { x: centerX + 180, y: currentY },
        data: {
          label: 'Audit Log (False)',
          config: { message: 'Condition false branch executed for payload: {{trigger}}' },
        },
      });

      edges.push({
        id: `edge_${condId}_false_${falseActionId}`,
        source: condId,
        target: falseActionId,
        sourceHandle: 'false',
        animated: true,
        style: { stroke: '#EF4444' },
      });
    } else {
      // Linear Action Pipeline
      const hasHttp =
        text.includes('http') ||
        text.includes('api') ||
        text.includes('slack') ||
        text.includes('discord') ||
        text.includes('post') ||
        text.includes('send') ||
        text.includes('notify');

      if (hasHttp) {
        const httpId = `http_${Date.now().toString(36).slice(-4)}`;
        nodes.push({
          id: httpId,
          type: 'http-request',
          position: { x: centerX, y: currentY },
          data: {
            label: 'HTTP Request Action',
            config: {
              method: 'POST',
              url: 'https://api.example.com/events',
              headers: { 'Content-Type': 'application/json' },
            },
          },
        });

        edges.push({
          id: `edge_${previousNodeId}_to_${httpId}`,
          source: previousNodeId,
          target: httpId,
          animated: true,
        });

        previousNodeId = httpId;
        currentY += 130;
      }

      // Final Logger checkpoint
      const loggerId = `logger_${Date.now().toString(36).slice(-4)}`;
      nodes.push({
        id: loggerId,
        type: 'logger',
        position: { x: centerX, y: currentY },
        data: {
          label: 'Completion Logger',
          config: { message: 'Workflow pipeline completed: {{trigger}}' },
        },
      });

      edges.push({
        id: `edge_${previousNodeId}_to_${loggerId}`,
        source: previousNodeId,
        target: loggerId,
        animated: true,
      });
    }

    const definition: WorkflowGraphDefinition = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 0.9 },
    };

    // Verify generated DAG via Kahn's algorithm
    const validation = this.validator.validateGraph(definition);
    if (!validation.isValid) {
      throw new BadRequestException(
        `AI Generator produced an invalid DAG: ${validation.errors.join('; ')}`,
      );
    }

    // Name inference from prompt
    const cleanedPrompt = prompt.trim();
    const words = cleanedPrompt.split(' ').slice(0, 5).join(' ');
    const name = words.charAt(0).toUpperCase() + words.slice(1);

    this.logger.log(`AI synthesized workflow "${name}" with ${nodes.length} nodes and ${edges.length} edges`);

    return {
      name,
      description: `Synthesized from prompt: "${prompt}"`,
      definition,
      summary: `Generated ${nodes.length} connected nodes (${nodes.map((n) => n.data?.label || n.type).join(' → ')}) with verified topological execution order.`,
    };
  }
}
