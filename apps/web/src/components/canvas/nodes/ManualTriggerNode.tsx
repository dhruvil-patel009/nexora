import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Play, Sparkles } from "lucide-react";

export function ManualTriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div
      className={`min-w-[200px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${
        selected ? "border-[#22D3EE] shadow-[#22D3EE]/20 shadow-lg" : "border-[#22D3EE]/50 hover:border-[#22D3EE]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "Manual Trigger"}
            </span>
            <span className="text-[10px] font-mono text-[#22D3EE]">Trigger</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#94A3B8] leading-tight">
        {data.description || "Start execution manually with test payload."}
      </p>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#22D3EE] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
