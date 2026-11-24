import { BadRequestException } from '@nestjs/common';
import { SsrfValidator } from '../security/ssrf-validator';

export interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutSeconds?: number;
}

export class HttpRequestHandler {
  private static readonly MAX_RESPONSE_BYTES = 1024 * 1024; // 1MB maximum payload
  private static readonly DEFAULT_TIMEOUT_SECONDS = 10;
  private static readonly MAX_TIMEOUT_SECONDS = 30;

  /**
   * Replaces {{variable.path}} patterns with evaluated values from execution context.
   */
  static interpolate(template: string, context: Record<string, any>): string {
    if (!template || typeof template !== 'string') return template;

    return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, path) => {
      const parts = path.split('.');
      let current = context;
      for (const part of parts) {
        if (current === undefined || current === null) return '';
        current = current[part];
      }
      return current !== undefined && current !== null ? String(current) : '';
    });
  }

  static async execute(config: HttpRequestConfig, context: Record<string, any>) {
    if (!config?.url?.trim()) {
      throw new BadRequestException('HTTP Request node requires a target URL');
    }

    const rawUrl = this.interpolate(config.url.trim(), context);

    // Enforce SSRF validation before connecting
    await SsrfValidator.validateUrl(rawUrl);

    const method = (config.method || 'GET').toUpperCase();
    const timeoutSeconds = Math.min(
      Math.max(Number(config.timeoutSeconds) || this.DEFAULT_TIMEOUT_SECONDS, 1),
      this.MAX_TIMEOUT_SECONDS,
    );

    // Prepare headers and interpolate values
    const headers: Record<string, string> = {
      'User-Agent': 'Nexora-Automation-Runner/1.0',
      Accept: 'application/json, text/plain, */*',
    };

    if (config.headers && typeof config.headers === 'object') {
      for (const [k, v] of Object.entries(config.headers)) {
        if (v && typeof v === 'string') {
          headers[k] = this.interpolate(v, context);
        }
      }
    }

    // Prepare body for mutating methods
    let bodyPayload: string | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && config.body) {
      if (typeof config.body === 'string') {
        bodyPayload = this.interpolate(config.body, context);
      } else {
        bodyPayload = JSON.stringify(config.body);
      }
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    try {
      const response = await fetch(rawUrl, {
        method,
        headers,
        body: bodyPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check Content-Length if present
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > this.MAX_RESPONSE_BYTES) {
        throw new BadRequestException(
          `Response size (${contentLength} bytes) exceeds maximum limit of 1MB.`,
        );
      }

      const text = await response.text();
      if (text.length > this.MAX_RESPONSE_BYTES) {
        throw new BadRequestException('Response payload exceeded 1MB limit during buffering.');
      }

      let parsedData: any = text;
      try {
        parsedData = JSON.parse(text);
      } catch {
        // Leave as string if not JSON
      }

      const durationMs = Date.now() - startTime;

      // Sanitize response headers for audit log
      const safeResponseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (['set-cookie', 'authorization'].includes(lowerKey)) {
          safeResponseHeaders[key] = '[REDACTED]';
        } else {
          safeResponseHeaders[key] = value;
        }
      });

      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: rawUrl,
        method,
        durationMs,
        headers: safeResponseHeaders,
        data: parsedData,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new BadRequestException(`HTTP Request timed out after ${timeoutSeconds} seconds.`);
      }
      throw err;
    }
  }
}
