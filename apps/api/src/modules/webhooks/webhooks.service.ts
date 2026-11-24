import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutionQueueService } from '../engine/execution.queue';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  private static readonly MAX_REQUESTS_PER_MINUTE = 120;
  private static readonly MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: ExecutionQueueService,
  ) {}

  /**
   * Rate limiting sliding window check
   */
  private checkRateLimit(tokenHash: string): void {
    const now = Date.now();
    const entry = this.rateLimits.get(tokenHash);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(tokenHash, {
        count: 1,
        resetAt: now + 60 * 1000,
      });
      return;
    }

    if (entry.count >= WebhooksService.MAX_REQUESTS_PER_MINUTE) {
      throw new HttpException(
        'Too Many Requests: Inbound webhook rate limit exceeded (max 120 requests/minute).',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
  }

  async handleInbound(
    token: string,
    body: any,
    headers: Record<string, any>,
    query: Record<string, any>,
  ) {
    if (!token || typeof token !== 'string' || token.length < 16) {
      throw new NotFoundException('Invalid webhook endpoint token');
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // 1. Rate limit check
    this.checkRateLimit(tokenHash);

    // 2. Lookup active endpoint and associated active workflow
    const endpoint = await this.prisma.webhookEndpoint.findUnique({
      where: { tokenHash },
      include: {
        workflow: true,
      },
    });

    if (!endpoint || !endpoint.isActive || !endpoint.workflow) {
      throw new NotFoundException('Webhook endpoint not found or inactive');
    }

    if (endpoint.workflow.status !== 'ACTIVE') {
      throw new BadRequestException('The target workflow is currently in DRAFT status and not published.');
    }

    // 3. Payload size check
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body || {});
    if (Buffer.byteLength(bodyString, 'utf8') > WebhooksService.MAX_PAYLOAD_BYTES) {
      throw new BadRequestException('Webhook payload exceeds 1MB limit');
    }

    // Sanitize headers to exclude internal proxy or sensitive tokens
    const safeHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      const lower = k.toLowerCase();
      if (!lower.startsWith('x-forwarded-') && lower !== 'cookie') {
        safeHeaders[k] = String(v);
      }
    }

    const triggerInput = {
      body: body || {},
      headers: safeHeaders,
      query: query || {},
      receivedAt: new Date().toISOString(),
    };

    // 4. Create Execution record
    const execution = await this.prisma.execution.create({
      data: {
        workspaceId: endpoint.workflow.workspaceId,
        workflowId: endpoint.workflow.id,
        workflowVersion: endpoint.workflow.currentVersion,
        triggerType: 'WEBHOOK',
        status: 'QUEUED',
        triggerInput,
      },
    });

    // 5. Enqueue into BullMQ runner
    await this.queue.addExecutionJob({
      executionId: execution.id,
      workflowId: endpoint.workflow.id,
      workflowVersion: endpoint.workflow.currentVersion,
      workspaceId: endpoint.workflow.workspaceId,
      triggerInput,
    });

    this.logger.log(
      `Inbound webhook received for workflow "${endpoint.workflow.name}" (${endpoint.workflow.id}) -> Execution ${execution.id}`,
    );

    return {
      success: true,
      executionId: execution.id,
      status: 'QUEUED',
      workflowId: endpoint.workflow.id,
      workflowName: endpoint.workflow.name,
      message: 'Workflow execution triggered via webhook successfully',
      receivedAt: triggerInput.receivedAt,
    };
  }
}
