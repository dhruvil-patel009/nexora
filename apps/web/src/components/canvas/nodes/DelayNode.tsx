import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Clock } from "lucide-react";

export function DelayNode({ data, selected }: { data: any; selected?: boolean }) {
  const duration = data.config?.durationSeconds || 5;

  return (
    <div
      className={`min-w-[200px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${
        selected ? "border-[#F59E0B] shadow-[#F59E0B]/20 shadow-lg" : "border-[#2A4365] hover:border-[#F59E0B]/60"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#94A3B8] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "Delay"}
            </span>
            <span className="text-[10px] font-mono text-[#F59E0B]">Queue Wait</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#101827] text-[#F59E0B] border border-[#F59E0B]/30">
          {duration}s
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#22D3EE] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
