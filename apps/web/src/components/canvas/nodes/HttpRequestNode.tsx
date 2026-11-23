import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";

export function HttpRequestNode({ data, selected }: { data: any; selected?: boolean }) {
  const method = data.config?.method || "GET";
  const url = data.config?.url || "https://api.example.com";

  return (
    <div
      className={`min-w-[220px] rounded-xl bg-[#172D43] border-2 transition-all p-3 shadow-xl ${
        selected ? "border-[#22D3EE] shadow-[#22D3EE]/20 shadow-lg" : "border-[#2A4365] hover:border-[#22D3EE]/60"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#94A3B8] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block leading-tight">
              {data.label || "HTTP Request"}
            </span>
            <span className="text-[10px] font-mono text-[#38BDF8]">Action</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#101827] text-[#22D3EE] border border-[#22D3EE]/30">
          {method}
        </span>
      </div>

      <div className="px-2 py-1 bg-[#101827] rounded border border-[#1E293B] text-[10px] font-mono text-[#94A3B8] truncate">
        {url}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#22D3EE] !border-2 !border-[#101827] transition-transform hover:scale-125"
      />
    </div>
  );
}
