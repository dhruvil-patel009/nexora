import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'List all workflows for the active workspace with filtering' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  async list(
    @CurrentWorkspace('id') workspaceId: string,
    @Query() query: QueryWorkflowDto,
  ) {
    return this.workflowsService.list(workspaceId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new visual workflow graph in the workspace' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(workspaceId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch single workflow with full graph definition' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async getById(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.getById(workspaceId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow metadata or graph definition (increments version)' })
  @ApiResponse({ status: 200, description: 'Workflow updated' })
  async update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a workflow and all version snapshots' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  async delete(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.delete(workspaceId, id);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish workflow: validates DAG, activates status, and generates secure webhook endpoint',
  })
  @ApiResponse({ status: 200, description: 'Workflow published with active webhook token' })
  @ApiResponse({ status: 400, description: 'Workflow validation failed' })
  async publish(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.publish(workspaceId, id);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unpublish workflow: deactivates webhook endpoint and sets status to DRAFT',
  })
  @ApiResponse({ status: 200, description: 'Workflow unpublished' })
  async unpublish(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.unpublish(workspaceId, id);
  }

  @Get(':id/webhook-endpoint')
  @ApiOperation({ summary: 'Get webhook endpoint status and metadata' })
  @ApiResponse({ status: 200, description: 'Webhook endpoint metadata' })
  async getWebhookEndpoint(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.getWebhookEndpoint(workspaceId, id);
  }
}
