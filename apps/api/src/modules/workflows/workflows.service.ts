import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
      // Validate definition schema shape
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
}
