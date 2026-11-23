import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayCircle, Search, Filter, RefreshCw } from "lucide-react";

export default function ExecutionsPage() {
  return (
    <>
      <TopBar
        title="Executions History"
        subtitle="Inspect execution telemetry, node step durations, and error summaries."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#172D43]/40 p-3 rounded-xl border border-[#1E293B]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Filter by execution ID or workflow name..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#101827] border border-[#2A4365] hover:border-[#22D3EE] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] transition-colors">
              <Filter className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Status: All</span>
            </button>
            <button className="flex items-center gap-1.5 bg-[#101827] border border-[#2A4365] hover:border-[#22D3EE] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Executions Table Shell */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">Execution Audit Logs (0)</span>
            <span className="text-xs font-mono text-[#64748B]">Persistent PostgreSQL & Redis BullMQ</span>
          </div>

          <div className="p-8">
            <EmptyState
              icon={PlayCircle}
              title="No executions recorded"
              description="Execution records are created automatically whenever a workflow runs manually, via inbound webhook, or on schedule. Full per-node inputs, outputs, and durations will be recorded here."
              actionLabel="View Workflows"
              actionHref="/workflows"
            />
          </div>
        </Card>
      </main>
    </>
  );
}
