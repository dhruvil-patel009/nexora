import React, { useState } from "react";
import { X, PlayCircle, CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface NodeExecutionItem {
  id: string;
  nodeId: string;
  nodeType: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "SKIPPED";
  durationMs?: number;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface ExecutionDetails {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  durationMs?: number;
  errorSummary?: string;
  nodeExecutions?: NodeExecutionItem[];
  createdAt: string;
}

interface ExecutionPanelProps {
  execution: ExecutionDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionPanel({ execution, isOpen, onClose }: ExecutionPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (!isOpen || !execution) return null;

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusVariant = {
    QUEUED: "warning" as const,
    RUNNING: "cyan" as const,
    SUCCEEDED: "success" as const,
    FAILED: "error" as const,
    CANCELLED: "muted" as const,
  }[execution.status];

  return (
    <div className="absolute bottom-0 left-0 right-0 max-h-[380px] bg-[#101827]/98 border-t-2 border-[#1E293B] shadow-2xl flex flex-col z-30 backdrop-blur-xl">
      {/* Drawer Header */}
      <div className="h-12 px-6 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#172D43]/40">
        <div className="flex items-center gap-3">
          <PlayCircle className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-xs font-semibold text-white">Execution Telemetry</span>
          <span className="text-[10px] font-mono text-[#64748B]">#{execution.id.slice(0, 8)}</span>
          <Badge variant={statusVariant} dot>
            {execution.status}
          </Badge>
          {execution.durationMs !== undefined && execution.durationMs !== null && (
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {execution.durationMs}ms
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#172D43] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error Banner if Failed */}
      {execution.errorSummary && (
        <div className="px-6 py-2 bg-[#EF4444]/15 border-b border-[#EF4444]/30 flex items-center gap-2 text-xs text-[#EF4444]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{execution.errorSummary}</span>
        </div>
      )}

      {/* Step Sequence List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!execution.nodeExecutions || execution.nodeExecutions.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-[#64748B]">
            Waiting for worker to dequeue and execute DAG steps...
          </div>
        ) : (
          execution.nodeExecutions.map((step, idx) => {
            const isExpanded = !!expandedNodes[step.id];
            const isSuccess = step.status === "SUCCEEDED";
            const isFailed = step.status === "FAILED";

            return (
              <div
                key={step.id}
                className="rounded-lg bg-[#172D43]/50 border border-[#2A4365] overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#172D43] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#64748B]">#{idx + 1}</span>
                    {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />}
                    {isFailed && <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />}
                    {!isSuccess && !isFailed && <Clock className="w-3.5 h-3.5 text-[#22D3EE] animate-spin" />}
                    <span className="text-xs font-semibold text-white">{step.nodeId}</span>
                    <span className="text-[10px] font-mono text-[#22D3EE] bg-[#101827] px-1.5 py-0.5 rounded border border-[#22D3EE]/20">
                      {step.nodeType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.durationMs !== null && step.durationMs !== undefined && (
                      <span className="text-[10px] font-mono text-[#94A3B8]">{step.durationMs}ms</span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 border-t border-[#1E293B] bg-[#101827] space-y-2 text-[11px] font-mono">
                    {step.errorMessage && (
                      <div className="text-[#EF4444] bg-[#EF4444]/10 p-2 rounded border border-[#EF4444]/30">
                        Error: {step.errorMessage}
                      </div>
                    )}
                    <div>
                      <span className="text-[#64748B] block mb-1">Step Output:</span>
                      <pre className="p-2.5 rounded bg-[#172D43]/40 border border-[#1E293B] text-[#22D3EE] overflow-x-auto max-h-36">
                        {JSON.stringify(step.outputData || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
