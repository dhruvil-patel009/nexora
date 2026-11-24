import { BadRequestException } from '@nestjs/common';

export interface ConditionConfig {
  variable: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'greater_than_or_equal'
    | 'less_than_or_equal'
    | 'is_empty'
    | 'is_not_empty';
  value?: string;
}

export class ConditionHandler {
  /**
   * Resolves a dot-path within the execution context, e.g. "steps.http-1.data.status"
   */
  static resolveValue(path: string, context: Record<string, any>): any {
    if (!path || typeof path !== 'string') return undefined;

    // Remove leading/trailing braces if present: {{steps.http-1.status}} -> steps.http-1.status
    const cleanPath = path.replace(/^\{\{\s*|\s*\}\}$/g, '');
    const parts = cleanPath.split('.');
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }

    return current;
  }

  /**
   * Evaluates comparison safely without any dynamic code execution (Zero-Eval).
   */
  static evaluate(config: ConditionConfig, context: Record<string, any>) {
    if (!config?.variable?.trim()) {
      throw new BadRequestException('Condition node requires a target variable path');
    }

    const leftValue = this.resolveValue(config.variable.trim(), context);
    const operator = config.operator || 'equals';
    const rawRightValue = config.value !== undefined ? config.value : '';

    let result = false;

    switch (operator) {
      case 'equals':
        // Safe string/number coercion comparison
        if (typeof leftValue === 'number') {
          result = leftValue === Number(rawRightValue);
        } else if (typeof leftValue === 'boolean') {
          result = leftValue === (rawRightValue === 'true' || (rawRightValue as unknown) === true);
        } else {
          result = String(leftValue ?? '') === String(rawRightValue);
        }
        break;

      case 'not_equals':
        if (typeof leftValue === 'number') {
          result = leftValue !== Number(rawRightValue);
        } else if (typeof leftValue === 'boolean') {
          result = leftValue !== (rawRightValue === 'true' || (rawRightValue as unknown) === true);
        } else {
          result = String(leftValue ?? '') !== String(rawRightValue);
        }
        break;

      case 'contains':
        if (Array.isArray(leftValue)) {
          result = leftValue.some((item) => String(item).includes(String(rawRightValue)));
        } else {
          result = String(leftValue ?? '').includes(String(rawRightValue));
        }
        break;

      case 'not_contains':
        if (Array.isArray(leftValue)) {
          result = !leftValue.some((item) => String(item).includes(String(rawRightValue)));
        } else {
          result = !String(leftValue ?? '').includes(String(rawRightValue));
        }
        break;

      case 'greater_than':
        result = Number(leftValue) > Number(rawRightValue);
        break;

      case 'less_than':
        result = Number(leftValue) < Number(rawRightValue);
        break;

      case 'greater_than_or_equal':
        result = Number(leftValue) >= Number(rawRightValue);
        break;

      case 'less_than_or_equal':
        result = Number(leftValue) <= Number(rawRightValue);
        break;

      case 'is_empty':
        result =
          leftValue === null ||
          leftValue === undefined ||
          leftValue === '' ||
          (Array.isArray(leftValue) && leftValue.length === 0) ||
          (typeof leftValue === 'object' && Object.keys(leftValue).length === 0);
        break;

      case 'is_not_empty':
        result =
          leftValue !== null &&
          leftValue !== undefined &&
          leftValue !== '' &&
          !(Array.isArray(leftValue) && leftValue.length === 0) &&
          !(typeof leftValue === 'object' && Object.keys(leftValue).length === 0);
        break;

      default:
        throw new BadRequestException(`Unsupported condition operator: "${operator}"`);
    }

    const branch = result ? 'true' : 'false';

    return {
      result,
      branch,
      variable: config.variable,
      leftValue: leftValue !== undefined ? leftValue : null,
      operator,
      rightValue: rawRightValue,
    };
  }
}
