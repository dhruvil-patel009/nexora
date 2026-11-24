import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { AiWorkflowGeneratorService } from './ai-workflow-generator.service';
import { AuthModule } from '../auth/auth.module';
import { EngineModule } from '../engine/engine.module';

@Module({
  imports: [AuthModule, EngineModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, AiWorkflowGeneratorService],
  exports: [WorkflowsService, AiWorkflowGeneratorService],
})
export class WorkflowsModule {}
