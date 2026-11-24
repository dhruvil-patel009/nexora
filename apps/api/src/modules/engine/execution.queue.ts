import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

export interface WorkflowExecutionJobData {
  executionId: string;
  workflowId: string;
  workflowVersion: number;
  workspaceId: string;
  triggerInput?: Record<string, unknown>;
}

@Injectable()
export class ExecutionQueueService {
  private readonly logger = new Logger(ExecutionQueueService.name);
  private queue!: Queue<WorkflowExecutionJobData>;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    this.queue = new Queue('nexora-workflow-executions', {
      connection: {
        host,
        port,
        password: password || undefined,
        maxRetriesPerRequest: null,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    this.logger.log(`BullMQ Execution Queue initialized on Redis ${host}:${port}`);
  }

  async addExecutionJob(data: WorkflowExecutionJobData) {
    const job = await this.queue.add(`run:${data.workflowId}:${data.executionId}`, data, {
      jobId: data.executionId,
    });
    this.logger.log(`Enqueued execution job ${job.id} for workflow ${data.workflowId}`);
    return job;
  }

  getQueue(): Queue<WorkflowExecutionJobData> {
    return this.queue;
  }
}
