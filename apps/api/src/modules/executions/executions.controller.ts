import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionsService } from './executions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

@ApiTags('Executions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post('workflows/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate DAG graph structure, check for cycles and missing triggers' })
  @ApiResponse({ status: 200, description: 'Validation results with topological execution order' })
  async validate(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') workflowId: string,
  ) {
    return this.executionsService.validateWorkflow(workspaceId, workflowId);
  }

  @Post('workflows/:id/run')
  @ApiOperation({ summary: 'Queue manual workflow execution run via BullMQ' })
  @ApiResponse({ status: 201, description: 'Workflow execution queued' })
  @ApiResponse({ status: 400, description: 'DAG validation error' })
  async run(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') workflowId: string,
    @Body('input') triggerInput?: Record<string, unknown>,
  ) {
    return this.executionsService.runWorkflow(workspaceId, workflowId, triggerInput);
  }

  @Post('workflows/:id/test-node')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute an isolated test run of a single node with sample context' })
  @ApiResponse({ status: 200, description: 'Node test results' })
  async testNode(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') workflowId: string,
    @Body() payload: { nodeType: string; config: any; sampleContext?: any },
  ) {
    return this.executionsService.testNode(workspaceId, workflowId, payload);
  }

  @Get('executions')
  @ApiOperation({ summary: 'List execution history for workspace' })
  @ApiResponse({ status: 200, description: 'Execution list' })
  async list(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
  ) {
    return this.executionsService.list(workspaceId, { workflowId, status });
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get execution details with all per-node step outputs and duration' })
  @ApiResponse({ status: 200, description: 'Execution details' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getById(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.executionsService.getById(workspaceId, id);
  }
}
