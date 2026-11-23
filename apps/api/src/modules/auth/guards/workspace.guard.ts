import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Determine target workspace: from header x-workspace-id or fallback to user's active token workspaceId
    const targetWorkspaceId =
      (request.headers['x-workspace-id'] as string) || user.workspaceId;

    if (!targetWorkspaceId) {
      throw new ForbiddenException('No active workspace specified');
    }

    // Verify membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: targetWorkspaceId,
          userId: user.id,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: You are not a member of this workspace');
    }

    // Attach active workspace and membership role to the request object
    request.workspace = membership.workspace;
    request.workspaceRole = membership.role;

    return true;
  }
}
