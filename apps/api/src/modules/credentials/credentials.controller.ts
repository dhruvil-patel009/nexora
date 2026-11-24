import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

@ApiTags('Credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({ summary: 'Encrypt and store a new secret credential in the vault' })
  @ApiResponse({ status: 201, description: 'Credential vaulted successfully' })
  @ApiResponse({ status: 409, description: 'Credential name already exists' })
  async create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body() dto: CreateCredentialDto,
  ) {
    return this.credentialsService.create(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vaulted credentials for workspace (secrets masked)' })
  @ApiResponse({ status: 200, description: 'Credentials retrieved' })
  async list(@CurrentWorkspace('id') workspaceId: string) {
    return this.credentialsService.list(workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a credential from the vault' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  async delete(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.credentialsService.delete(workspaceId, id);
  }
}
