import { Module } from '@nestjs/common';
import { ValidatorService } from './validator.service';
import { ExecutionQueueService } from './execution.queue';
import { ExecutionWorkerService } from './execution.worker';

@Module({
  providers: [ValidatorService, ExecutionQueueService, ExecutionWorkerService],
  exports: [ValidatorService, ExecutionQueueService, ExecutionWorkerService],
})
export class EngineModule {}
