import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Webhook } from "lucide-react";
import { getNodeStatusStyle, NodeExecutionBadge } from "./node-status";

export function WebhookTriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  const statusStyle = getNodeStatusStyle(selected, data.executionStatus);

  return (
    <div
      className={`min-w-[220px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${statusStyle}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
            <Webhook className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "Webhook Trigger"}
            </span>
            <span className="text-[10px] font-mono text-[#22D3EE]">Trigger</span>
          </div>
        </div>
        <NodeExecutionBadge status={data.executionStatus} />
      </div>
      <div className="px-2 py-1 bg-[#101827] rounded border border-[#1E293B] text-[10px] font-mono text-[#94A3B8] truncate">
        POST /api/v1/webhooks/:token
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#22D3EE] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
