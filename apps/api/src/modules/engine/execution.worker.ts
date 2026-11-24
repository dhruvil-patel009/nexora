import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidatorService } from './validator.service';
import { WorkflowExecutionJobData } from './execution.queue';
import { WorkflowGraphDefinition, WorkflowNode } from '@nexora/shared';
import { HttpRequestHandler } from './node-handlers/http-request.handler';
import { ConditionHandler } from './node-handlers/condition.handler';
import { EncryptionService } from '../credentials/encryption.service';

@Injectable()
export class ExecutionWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExecutionWorkerService.name);
  private worker!: Worker<WorkflowExecutionJobData>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    this.worker = new Worker<WorkflowExecutionJobData>(
      'nexora-workflow-executions',
      async (job: Job<WorkflowExecutionJobData>) => {
        return this.processJob(job.data);
      },
      {
        connection: {
          host,
          port,
          password: password || undefined,
          maxRetriesPerRequest: null,
        },
        concurrency: 5,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Execution job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Execution job ${job?.id} failed: ${err.message}`, err.stack);
    });

    this.logger.log('BullMQ Execution Worker started listening for workflow jobs');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('BullMQ Execution Worker shut down');
    }
  }

  private async processJob(data: WorkflowExecutionJobData) {
    const { executionId, workflowId, triggerInput } = data;
    this.logger.log(`Starting execution run: ${executionId} for workflow ${workflowId}`);

    // Mark Execution as RUNNING
    await this.prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Load workflow definition
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const definition = workflow.definition as unknown as WorkflowGraphDefinition;
    const validation = this.validator.validateGraph(definition);

    if (!validation.isValid || !validation.executionOrder) {
      const errorSummary = validation.errors.join('; ');
      await this.prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          errorSummary,
          finishedAt: new Date(),
        },
      });
      return;
    }

    // Load vaulted credentials for workspace in-memory (never persisted in logs/context)
    const vaultedCredentials = await this.prisma.credential.findMany({
      where: { workspaceId: workflow.workspaceId },
    });

    const credentialsMap: Record<string, string> = {};
    for (const cred of vaultedCredentials) {
      try {
        const decrypted = EncryptionService.decrypt(
          cred.encryptedData,
          cred.iv,
          cred.authTag,
        );
        credentialsMap[cred.name] = decrypted;
      } catch (err: any) {
        this.logger.warn(`Could not decrypt credential "${cred.name}": ${err.message}`);
      }
    }

    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of definition.nodes) {
      nodeMap.set(node.id, node);
    }

    // Shared execution context holding outputs of previous steps
    const triggerData = (triggerInput as any)?.body ? (triggerInput as any).body : (triggerInput || {});
    const executionContext: Record<string, any> = {
      trigger: triggerData,
      $trigger: triggerInput || {},
      steps: {},
    };

    const skippedNodes = new Set<string>();
    const edges = definition.edges || [];

    // Helper to recursively mark downstream nodes as skipped
    const markSubtreeSkipped = (startNodeId: string) => {
      const queue = [startNodeId];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        skippedNodes.add(currentId);
        const outbound = edges.filter((e) => e.source === currentId);
        for (const edge of outbound) {
          if (!skippedNodes.has(edge.target)) {
            queue.push(edge.target);
          }
        }
      }
    };

    let executionFailed = false;
    let finalErrorSummary: string | null = null;

    // Execute in topological order
    for (const nodeId of validation.executionOrder) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      // If node is on a disabled branch, mark SKIPPED and do not execute
      if (skippedNodes.has(nodeId)) {
        await this.prisma.nodeExecution.create({
          data: {
            executionId,
            nodeId: node.id,
            nodeType: node.type,
            status: 'SKIPPED',
            inputData: { ...executionContext },
            startedAt: new Date(),
            finishedAt: new Date(),
            durationMs: 0,
          },
        });
        continue;
      }

      const nodeStartTime = Date.now();

      // Create NodeExecution record
      const nodeExec = await this.prisma.nodeExecution.create({
        data: {
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          status: 'RUNNING',
          inputData: { ...executionContext },
          startedAt: new Date(),
        },
      });

      try {
        let nodeOutput: any = {};

        switch (node.type) {
          case 'manual-trigger':
            nodeOutput = {
              triggeredAt: new Date().toISOString(),
              payload: triggerInput || { status: 'triggered_manually', timestamp: Date.now() },
            };
            break;

          case 'webhook-trigger':
            nodeOutput = {
              receivedAt: (triggerInput as any)?.receivedAt || new Date().toISOString(),
              body: (triggerInput as any)?.body ?? triggerInput ?? {},
              headers: (triggerInput as any)?.headers ?? {},
              query: (triggerInput as any)?.query ?? {},
            };
            break;

          case 'logger':
            const rawMsg = String((node.data?.config as any)?.message || 'Execution milestone reached');
            const logMsg = HttpRequestHandler.interpolate(rawMsg, executionContext, credentialsMap);
            nodeOutput = {
              message: logMsg,
              loggedAt: new Date().toISOString(),
              contextSnapshot: {
                previousSteps: Object.keys(executionContext.steps),
              },
            };
            break;

          case 'delay':
            const delaySec = Number(node.data?.config?.durationSeconds) || 1;
            const safeDelay = Math.min(delaySec, 5);
            await new Promise((resolve) => setTimeout(resolve, safeDelay * 1000));
            nodeOutput = {
              delayedSeconds: safeDelay,
              resumedAt: new Date().toISOString(),
            };
            break;

          case 'http-request':
            nodeOutput = await HttpRequestHandler.execute(
              (node.data?.config as any) || {},
              executionContext,
              credentialsMap,
            );
            break;

          case 'condition':
            nodeOutput = ConditionHandler.evaluate(
              (node.data?.config as any) || {},
              executionContext,
            );

            // Conditional branch routing: prune edges that do not match active branch
            const activeBranch = nodeOutput.branch; // 'true' or 'false'
            const outboundEdges = edges.filter((e) => e.source === node.id);

            for (const edge of outboundEdges) {
              // If edge specifies a sourceHandle ('true' or 'false') and it does not match active branch
              if (edge.sourceHandle && edge.sourceHandle !== activeBranch) {
                markSubtreeSkipped(edge.target);
              }
            }
            break;

          default:
            nodeOutput = { executed: true, nodeType: node.type };
        }

        const durationMs = Date.now() - nodeStartTime;

        // Save step output to context
        executionContext.steps[node.id] = nodeOutput;

        // Mark NodeExecution SUCCEEDED
        await this.prisma.nodeExecution.update({
          where: { id: nodeExec.id },
          data: {
            status: 'SUCCEEDED',
            outputData: nodeOutput,
            durationMs,
            finishedAt: new Date(),
          },
        });
      } catch (err: any) {
        const durationMs = Date.now() - nodeStartTime;
        executionFailed = true;
        finalErrorSummary = `Node "${node.data?.label || node.id}" failed: ${err.message}`;

        await this.prisma.nodeExecution.update({
          where: { id: nodeExec.id },
          data: {
            status: 'FAILED',
            errorMessage: err.message,
            durationMs,
            finishedAt: new Date(),
          },
        });

        break; // Halt downstream execution on failure
      }
    }

    // Mark overall Execution status
    await this.prisma.execution.update({
      where: { id: executionId },
      data: {
        status: executionFailed ? 'FAILED' : 'SUCCEEDED',
        errorSummary: finalErrorSummary,
        outputSummary: executionContext.steps,
        finishedAt: new Date(),
      },
    });

    this.logger.log(`Execution ${executionId} completed with status: ${executionFailed ? 'FAILED' : 'SUCCEEDED'}`);
  }
}
