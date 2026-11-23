import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatusEnum } from './update-workflow.dto';

export class QueryWorkflowDto {
  @ApiProperty({ required: false, description: 'Search query matching workflow name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: WorkflowStatusEnum, required: false, description: 'Filter by workflow lifecycle status' })
  @IsOptional()
  @IsEnum(WorkflowStatusEnum)
  status?: WorkflowStatusEnum;
}
