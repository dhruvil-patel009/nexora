import { describe, it, expect } from 'vitest';
import { ConditionHandler } from '../../apps/api/src/modules/engine/node-handlers/condition.handler';

describe('ConditionHandler - Zero-Eval Rule Evaluator', () => {
  const context = {
    trigger: {
      status: 'active',
      score: 95,
      verified: true,
      tags: ['lead', 'enterprise', 'vip'],
      emptyList: [],
    },
    steps: {
      http_node: {
        status: 200,
        data: { message: 'success' },
      },
    },
  };

  it('evaluates "equals" operator correctly for strings, numbers, and booleans', () => {
    expect(
      ConditionHandler.evaluate({ variable: 'trigger.status', operator: 'equals', value: 'active' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.status', operator: 'equals', value: 'inactive' }, context).branch,
    ).toBe('false');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.score', operator: 'equals', value: '95' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.verified', operator: 'equals', value: 'true' }, context).branch,
    ).toBe('true');
  });

  it('evaluates "not_equals" operator correctly', () => {
    expect(
      ConditionHandler.evaluate({ variable: 'trigger.status', operator: 'not_equals', value: 'pending' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.status', operator: 'not_equals', value: 'active' }, context).branch,
    ).toBe('false');
  });

  it('evaluates "contains" and "not_contains" for strings and arrays', () => {
    expect(
      ConditionHandler.evaluate({ variable: 'trigger.status', operator: 'contains', value: 'act' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.tags', operator: 'contains', value: 'enterprise' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.tags', operator: 'not_contains', value: 'spam' }, context).branch,
    ).toBe('true');
  });

  it('evaluates numeric comparisons: greater_than, less_than', () => {
    expect(
      ConditionHandler.evaluate({ variable: 'trigger.score', operator: 'greater_than', value: '80' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.score', operator: 'less_than', value: '50' }, context).branch,
    ).toBe('false');
  });

  it('evaluates "is_empty" and "is_not_empty"', () => {
    expect(
      ConditionHandler.evaluate({ variable: 'trigger.emptyList', operator: 'is_empty' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.tags', operator: 'is_not_empty' }, context).branch,
    ).toBe('true');

    expect(
      ConditionHandler.evaluate({ variable: 'trigger.missingProp', operator: 'is_empty' }, context).branch,
    ).toBe('true');
  });

  it('resolves deeply nested step output values safely', () => {
    const result = ConditionHandler.evaluate(
      { variable: 'steps.http_node.data.message', operator: 'equals', value: 'success' },
      context,
    );
    expect(result.branch).toBe('true');
    expect(result.leftValue).toBe('success');
  });
});
