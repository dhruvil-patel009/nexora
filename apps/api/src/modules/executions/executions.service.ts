import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidatorService } from '../engine/validator.service';
import { ExecutionQueueService } from '../engine/execution.queue';
import { WorkflowGraphDefinition } from '@nexora/shared';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: ValidatorService,
    private readonly queue: ExecutionQueueService,
  ) {}

  async validateWorkflow(workspaceId: string, workflowId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    const definition = workflow.definition as unknown as WorkflowGraphDefinition;
    return this.validator.validateGraph(definition);
  }

  async runWorkflow(
    workspaceId: string,
    workflowId: string,
    triggerInput?: Record<string, unknown>,
  ) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    // 1. Validate graph before execution
    const definition = workflow.definition as unknown as WorkflowGraphDefinition;
    const validation = this.validator.validateGraph(definition);

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Workflow graph validation failed',
        errors: validation.errors,
      });
    }

    // 2. Persist execution record in status QUEUED
    const execution = await this.prisma.execution.create({
      data: {
        workspaceId,
        workflowId,
        workflowVersion: workflow.currentVersion,
        triggerType: 'MANUAL',
        status: 'QUEUED',
        triggerInput: (triggerInput as any) || {},
      },
    });

    // 3. Enqueue job into BullMQ
    await this.queue.addExecutionJob({
      executionId: execution.id,
      workflowId,
      workflowVersion: workflow.currentVersion,
      workspaceId,
      triggerInput,
    });

    this.logger.log(`Workflow run initiated: ${execution.id} for workflow "${workflow.name}"`);

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      createdAt: execution.createdAt,
    };
  }

  async list(workspaceId: string, query?: { workflowId?: string; status?: string }) {
    const where: any = { workspaceId };
    if (query?.workflowId) where.workflowId = query.workflowId;
    if (query?.status) where.status = query.status;

    const executions = await this.prisma.execution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        workflow: {
          select: { name: true },
        },
      },
    });

    return executions.map((ex) => {
      const durationMs =
        ex.startedAt && ex.finishedAt
          ? ex.finishedAt.getTime() - ex.startedAt.getTime()
          : null;

      return {
        id: ex.id,
        workflowId: ex.workflowId,
        workflowName: ex.workflow.name,
        workflowVersion: ex.workflowVersion,
        triggerType: ex.triggerType,
        status: ex.status,
        durationMs,
        startedAt: ex.startedAt,
        finishedAt: ex.finishedAt,
        errorSummary: ex.errorSummary,
        createdAt: ex.createdAt,
      };
    });
  }

  async getById(workspaceId: string, id: string) {
    const execution = await this.prisma.execution.findFirst({
      where: { id, workspaceId },
      include: {
        workflow: {
          select: { name: true, definition: true },
        },
        nodeExecutions: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException(`Execution run ${id} not found`);
    }

    const durationMs =
      execution.startedAt && execution.finishedAt
        ? execution.finishedAt.getTime() - execution.startedAt.getTime()
        : null;

    return {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow.name,
      workflowVersion: execution.workflowVersion,
      triggerType: execution.triggerType,
      status: execution.status,
      triggerInput: execution.triggerInput,
      outputSummary: execution.outputSummary,
      errorSummary: execution.errorSummary,
      durationMs,
      startedAt: execution.startedAt,
      finishedAt: execution.finishedAt,
      createdAt: execution.createdAt,
      nodeExecutions: execution.nodeExecutions.map((ne) => ({
        id: ne.id,
        nodeId: ne.nodeId,
        nodeType: ne.nodeType,
        status: ne.status,
        inputData: ne.inputData,
        outputData: ne.outputData,
        errorMessage: ne.errorMessage,
        durationMs: ne.durationMs,
        startedAt: ne.startedAt,
        finishedAt: ne.finishedAt,
      })),
    };
  }
}
