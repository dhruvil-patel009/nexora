import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

@ApiTags('Workspace Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get live workspace execution metrics, counts, and recent runs' })
  @ApiResponse({ status: 200, description: 'Workspace analytics retrieved' })
  async getAnalytics(@CurrentWorkspace('id') workspaceId: string) {
    return this.workspaceService.getAnalytics(workspaceId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get workspace profile, member roles, and settings' })
  @ApiResponse({ status: 200, description: 'Workspace profile retrieved' })
  async getProfile(@CurrentWorkspace('id') workspaceId: string) {
    return this.workspaceService.getProfile(workspaceId);
  }
}
