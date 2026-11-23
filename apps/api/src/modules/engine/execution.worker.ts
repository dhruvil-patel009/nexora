import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidatorService } from './validator.service';
import { WorkflowExecutionJobData } from './execution.queue';
import { WorkflowGraphDefinition, WorkflowNode } from '@nexora/shared';

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

    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of definition.nodes) {
      nodeMap.set(node.id, node);
    }

    // Shared execution context holding outputs of previous steps
    const executionContext: Record<string, any> = {
      trigger: triggerInput || {},
      steps: {},
    };

    let executionFailed = false;
    let finalErrorSummary: string | null = null;

    // Execute in topological order
    for (const nodeId of validation.executionOrder) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

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
              receivedAt: new Date().toISOString(),
              payload: triggerInput || {},
            };
            break;

          case 'logger':
            const logMsg = node.data?.config?.message || 'Execution milestone reached';
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
            // Short test delay (capped at 5s during worker loop)
            const safeDelay = Math.min(delaySec, 5);
            await new Promise((resolve) => setTimeout(resolve, safeDelay * 1000));
            nodeOutput = {
              delayedSeconds: safeDelay,
              resumedAt: new Date().toISOString(),
            };
            break;

          case 'http-request':
            nodeOutput = {
              status: 200,
              statusText: 'OK',
              simulated: true,
              url: node.data?.config?.url || 'https://api.example.com',
              data: { success: true },
            };
            break;

          case 'condition':
            nodeOutput = {
              result: true,
              operator: node.data?.config?.operator || 'equals',
              branch: 'true',
            };
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
