import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Clock } from "lucide-react";
import { getNodeStatusStyle, NodeExecutionBadge } from "./node-status";

export function DelayNode({ data, selected }: { data: any; selected?: boolean }) {
  const duration = data.config?.durationSeconds || 1;
  const statusStyle = getNodeStatusStyle(selected, data.executionStatus);

  return (
    <div
      className={`min-w-[200px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${statusStyle}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#94A3B8] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "Delay"}
            </span>
            <span className="text-[10px] font-mono text-[#A855F7]">Pause</span>
          </div>
        </div>
        <NodeExecutionBadge status={data.executionStatus} />
      </div>

      <div className="px-2 py-1 bg-[#101827] rounded border border-[#1E293B] text-[10px] font-mono text-[#94A3B8] truncate">
        Wait {duration} second{duration === 1 ? "" : "s"}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#22D3EE] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
