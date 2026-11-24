import { IsNotEmpty, IsOptional, MaxLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Customer Onboarding Flow', description: 'Human-readable workflow name' })
  @IsNotEmpty({ message: 'Workflow name is required' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'Validates incoming customer webhook and syncs details via HTTP API',
    required: false,
    description: 'Optional workflow description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
