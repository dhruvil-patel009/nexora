import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks Gateway')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':token')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Public Inbound Webhook Listener - triggers workflow execution asynchronously',
  })
  @ApiResponse({
    status: 202,
    description: 'Webhook received, validated, and workflow execution queued',
  })
  @ApiResponse({
    status: 404,
    description: 'Endpoint token invalid, inactive, or not found',
  })
  async receiveWebhook(
    @Param('token') token: string,
    @Body() body: any,
    @Headers() headers: Record<string, any>,
    @Query() query: Record<string, any>,
  ) {
    return this.webhooksService.handleInbound(token, body, headers, query);
  }
}
