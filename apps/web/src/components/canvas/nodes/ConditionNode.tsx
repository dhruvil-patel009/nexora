import React from "react";
import { Handle, Position } from "@xyflow/react";
import { GitFork } from "lucide-react";
import { getNodeStatusStyle, NodeExecutionBadge } from "./node-status";

export function ConditionNode({ data, selected }: { data: any; selected?: boolean }) {
  const operator = data.config?.operator || "equals";
  const variable = data.config?.variable || "trigger.status";
  const statusStyle = getNodeStatusStyle(selected, data.executionStatus);

  return (
    <div
      className={`min-w-[220px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${statusStyle}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#94A3B8] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "Condition"}
            </span>
            <span className="text-[10px] font-mono text-[#8B5CF6]">Logic Branch</span>
          </div>
        </div>
        <NodeExecutionBadge status={data.executionStatus} />
      </div>

      <div className="px-2 py-1 bg-[#101827] rounded border border-[#1E293B] text-[10px] font-mono text-[#94A3B8] truncate">
        {variable} {operator}
      </div>

      {/* Dual Branching Handles: Left (True) & Right (False) */}
      <div className="flex justify-between items-center px-4 pt-3 text-[9px] font-mono font-bold">
        <span className="text-[#22C55E]">TRUE</span>
        <span className="text-[#EF4444]">FALSE</span>
      </div>

      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className="!w-3 !h-3 !bg-[#22C55E] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />

      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className="!w-3 !h-3 !bg-[#EF4444] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
