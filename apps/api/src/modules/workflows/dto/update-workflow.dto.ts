import { IsOptional, MaxLength, IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkflowStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateWorkflowDto {
  @ApiProperty({ example: 'Updated Flow Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: WorkflowStatusEnum, required: false })
  @IsOptional()
  @IsEnum(WorkflowStatusEnum)
  status?: WorkflowStatusEnum;

  @ApiProperty({
    example: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    required: false,
    description: 'Sanitized workflow graph definition JSON',
  })
  @IsOptional()
  @IsObject()
  definition?: Record<string, any>;
}
