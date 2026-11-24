import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidatorService } from '../engine/validator.service';
import { AiWorkflowGeneratorService } from './ai-workflow-generator.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
import { WorkflowStatus } from '@prisma/client';
import { WorkflowGraphDefinition } from '@nexora/shared';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: ValidatorService,
    private readonly aiGenerator: AiWorkflowGeneratorService,
  ) {}

  async generateFromAi(workspaceId: string, prompt: string, customName?: string) {
    const generated = this.aiGenerator.generateFromPrompt(prompt);
    const name = customName?.trim() || generated.name;

    const workflow = await this.prisma.$transaction(async (tx) => {
      const created = await tx.workflow.create({
        data: {
          workspaceId,
          name,
          description: generated.description,
          status: 'DRAFT',
          definition: generated.definition as any,
          currentVersion: 1,
        },
      });

      await tx.workflowVersion.create({
        data: {
          workflowId: created.id,
          version: 1,
          definition: generated.definition as any,
        },
      });

      return created;
    });

    this.logger.log(`Workflow generated from AI prompt: "${workflow.name}" (${workflow.id})`);
    return {
      workflow,
      summary: generated.summary,
    };
  }

  async list(workspaceId: string, query: QueryWorkflowDto) {
    const where: any = { workspaceId };

    if (query.status) {
      where.status = query.status as WorkflowStatus;
    }

    if (query.search?.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const workflows = await this.prisma.workflow.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        webhookEndpoint: true,
        _count: {
          select: { executions: true, versions: true },
        },
      },
    });

    return workflows.map((wf) => {
      const def = (wf.definition as any) || { nodes: [], edges: [] };
      return {
        id: wf.id,
        workspaceId: wf.workspaceId,
        name: wf.name,
        description: wf.description,
        status: wf.status,
        currentVersion: wf.currentVersion,
        nodeCount: Array.isArray(def.nodes) ? def.nodes.length : 0,
        edgeCount: Array.isArray(def.edges) ? def.edges.length : 0,
        executionCount: wf._count.executions,
        publishedAt: wf.publishedAt,
        hasWebhook: !!wf.webhookEndpoint?.isActive,
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
      };
    });
  }

  async create(workspaceId: string, dto: CreateWorkflowDto) {
    // Initial baseline graph: empty DAG
    const initialDefinition = {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    const workflow = await this.prisma.$transaction(async (tx) => {
      const created = await tx.workflow.create({
        data: {
          workspaceId,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          status: 'DRAFT',
          definition: initialDefinition,
          currentVersion: 1,
        },
      });

      // Create snapshot version 1
      await tx.workflowVersion.create({
        data: {
          workflowId: created.id,
          version: 1,
          definition: initialDefinition,
        },
      });

      return created;
    });

    this.logger.log(`Workflow created: "${workflow.name}" (${workflow.id}) in workspace ${workspaceId}`);
    return workflow;
  }

  async getById(workspaceId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
      include: {
        webhookEndpoint: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    return workflow;
  }

  async update(workspaceId: string, id: string, dto: UpdateWorkflowDto) {
    const existing = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.status !== undefined) data.status = dto.status as WorkflowStatus;

    // If definition updated, increment version and record snapshot
    if (dto.definition !== undefined) {
      if (typeof dto.definition !== 'object' || dto.definition === null) {
        throw new BadRequestException('Workflow definition must be a valid JSON object');
      }

      data.definition = dto.definition;
      const nextVersion = existing.currentVersion + 1;
      data.currentVersion = nextVersion;

      const updated = await this.prisma.$transaction(async (tx) => {
        const wf = await tx.workflow.update({
          where: { id },
          data,
          include: { webhookEndpoint: true },
        });

        await tx.workflowVersion.create({
          data: {
            workflowId: id,
            version: nextVersion,
            definition: dto.definition!,
          },
        });

        return wf;
      });

      this.logger.log(`Workflow updated with new version ${nextVersion}: ${updated.name} (${id})`);
      return updated;
    }

    const updated = await this.prisma.workflow.update({
      where: { id },
      data,
      include: { webhookEndpoint: true },
    });

    return updated;
  }

  async delete(workspaceId: string, id: string) {
    const existing = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    await this.prisma.workflow.delete({
      where: { id },
    });

    this.logger.log(`Workflow deleted: ${existing.name} (${id})`);
    return { success: true, message: `Workflow "${existing.name}" deleted successfully` };
  }

  /**
   * Validates DAG and publishes the workflow, creating/updating an active webhook endpoint.
   */
  async publish(workspaceId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
      include: { webhookEndpoint: true },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    // 1. Validate graph DAG
    const definition = workflow.definition as unknown as WorkflowGraphDefinition;
    const validation = this.validator.validateGraph(definition);

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Cannot publish workflow with graph validation errors',
        errors: validation.errors,
      });
    }

    // 2. Generate secure 32-byte webhook token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Upsert WebhookEndpoint
    await this.prisma.webhookEndpoint.upsert({
      where: { workflowId: id },
      create: {
        workflowId: id,
        tokenHash,
        isActive: true,
      },
      update: {
        tokenHash,
        isActive: true,
      },
    });

    // 4. Update Workflow status to ACTIVE and set publishedAt timestamp
    const updated = await this.prisma.workflow.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
      },
      include: { webhookEndpoint: true },
    });

    this.logger.log(`Workflow published: "${updated.name}" (${updated.id}) - status ACTIVE`);

    return {
      workflowId: updated.id,
      name: updated.name,
      status: updated.status,
      token,
      webhookPath: `/api/v1/webhooks/${token}`,
      publishedAt: updated.publishedAt,
    };
  }

  /**
   * Unpublishes a workflow, deactivating the webhook endpoint and switching status to DRAFT.
   */
  async unpublish(workspaceId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    // Deactivate endpoint if present
    await this.prisma.webhookEndpoint.updateMany({
      where: { workflowId: id },
      data: { isActive: false },
    });

    // Set workflow status to DRAFT
    const updated = await this.prisma.workflow.update({
      where: { id },
      data: { status: 'DRAFT' },
      include: { webhookEndpoint: true },
    });

    this.logger.log(`Workflow unpublished: "${updated.name}" (${updated.id}) - status DRAFT`);

    return {
      workflowId: updated.id,
      status: updated.status,
      message: 'Workflow successfully unpublished and set to DRAFT',
    };
  }

  /**
   * Retrieves active webhook endpoint status for the workflow.
   */
  async getWebhookEndpoint(workspaceId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, workspaceId },
      include: { webhookEndpoint: true },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found in this workspace`);
    }

    return {
      workflowId: id,
      isPublished: workflow.status === 'ACTIVE',
      publishedAt: workflow.publishedAt,
      hasActiveWebhook: !!workflow.webhookEndpoint?.isActive,
      endpointId: workflow.webhookEndpoint?.id || null,
    };
  }
}
