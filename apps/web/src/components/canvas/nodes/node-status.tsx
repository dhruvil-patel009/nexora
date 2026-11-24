import React from "react";

export function getNodeStatusStyle(selected?: boolean, executionStatus?: string): string {
  if (executionStatus === "RUNNING") {
    return "border-[#22D3EE] shadow-lg shadow-[#22D3EE]/30 ring-2 ring-[#22D3EE]/50 animate-pulse";
  }
  if (executionStatus === "SUCCEEDED") {
    return "border-[#22C55E] shadow-md shadow-[#22C55E]/20";
  }
  if (executionStatus === "FAILED") {
    return "border-[#EF4444] shadow-md shadow-[#EF4444]/20";
  }
  if (executionStatus === "SKIPPED") {
    return "border-[#334155] opacity-40";
  }
  if (selected) {
    return "border-[#22D3EE] shadow-lg shadow-[#22D3EE]/20";
  }
  return "border-[#2A4365] hover:border-[#22D3EE]/60";
}

export function NodeExecutionBadge({ status }: { status?: string }) {
  if (!status) return null;

  if (status === "RUNNING") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
        RUNNING
      </span>
    );
  }

  if (status === "SUCCEEDED") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40">
        ✓ DONE
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
        ✕ FAILED
      </span>
    );
  }

  if (status === "SKIPPED") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#334155]/40 text-[#94A3B8] border border-[#334155]">
        SKIPPED
      </span>
    );
  }

  return null;
}
