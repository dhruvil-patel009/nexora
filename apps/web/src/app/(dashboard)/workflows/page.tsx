import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Workflow, Search, Filter, Plus } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <>
      <TopBar
        title="Workflows"
        subtitle="Manage and orchestrate visual automation graphs."
        action={{
          label: "New Workflow",
          onClick: undefined,
        }}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#172D43]/40 p-3 rounded-xl border border-[#1E293B]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search workflows by name or tag..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#101827] border border-[#2A4365] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8]">
              <Filter className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Status: All</span>
            </div>
          </div>
        </div>

        {/* Workflows List Shell with Honest Empty State */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">All Workflows (0)</span>
            <span className="text-xs font-mono text-[#64748B]">Updated real-time</span>
          </div>

          <div className="p-8">
            <EmptyState
              icon={Workflow}
              title="No workflows in this workspace"
              description="Start automating repetitive processes by building your first visual workflow with drag-and-drop triggers, API requests, and conditional branching."
              actionLabel="Create Your First Workflow"
            />
          </div>
        </Card>
      </main>
    </>
  );
}
