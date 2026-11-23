import { ManualTriggerNode } from "./ManualTriggerNode";
import { WebhookTriggerNode } from "./WebhookTriggerNode";
import { HttpRequestNode } from "./HttpRequestNode";
import { ConditionNode } from "./ConditionNode";
import { DelayNode } from "./DelayNode";
import { LoggerNode } from "./LoggerNode";

export const nodeTypes = {
  "manual-trigger": ManualTriggerNode,
  "webhook-trigger": WebhookTriggerNode,
  "http-request": HttpRequestNode,
  condition: ConditionNode,
  delay: DelayNode,
  logger: LoggerNode,
};
