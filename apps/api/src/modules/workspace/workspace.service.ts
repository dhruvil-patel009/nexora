import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(workspaceId: string) {
    const [
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      succeededExecutions,
      failedExecutions,
      totalCredentials,
      recentExecutions,
    ] = await Promise.all([
      this.prisma.workflow.count({ where: { workspaceId } }),
      this.prisma.workflow.count({ where: { workspaceId, status: 'ACTIVE' } }),
      this.prisma.execution.count({ where: { workspaceId } }),
      this.prisma.execution.count({ where: { workspaceId, status: 'SUCCEEDED' } }),
      this.prisma.execution.count({ where: { workspaceId, status: 'FAILED' } }),
      this.prisma.credential.count({ where: { workspaceId } }),
      this.prisma.execution.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          workflow: {
            select: { name: true },
          },
        },
      }),
    ]);

    const successRate =
      totalExecutions > 0 ? Math.round((succeededExecutions / totalExecutions) * 100) : 100;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        succeededExecutions,
        failedExecutions,
        successRate,
        totalCredentials,
      },
      recentExecutions: recentExecutions.map((exec) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: exec.workflow.name,
        triggerType: exec.triggerType,
        status: exec.status,
        createdAt: exec.createdAt,
      })),
    };
  }

  async getProfile(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: workspace.createdAt,
      memberCount: workspace.members.length,
      members: workspace.members.map((m) => ({
        id: m.id,
        role: m.role,
        userId: m.user.id,
        fullName: m.user.fullName,
        email: m.user.email,
      })),
    };
  }
}
