import React from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Workflow, PlayCircle, KeyRound, Cpu, ArrowUpRight, Plus, Activity, Layers } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <TopBar
        title="Workspace Overview"
        subtitle="Real-time metrics, active workflows, and execution telemetry."
        action={{
          label: "Create Workflow",
          href: "/workflows",
        }}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl">
        {/* Real Summary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Total Workflows</span>
              <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE]">
                <Workflow className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">0</span>
              <span className="text-xs text-[#64748B]">active DAGs</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Executions</span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">0</span>
              <span className="text-xs text-[#64748B]">recorded runs</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Stored Credentials</span>
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">0</span>
              <span className="text-xs text-[#22C55E]">encrypted vault</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Runtime Engine</span>
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[#22C55E] font-mono">HEALTHY</span>
              <span className="text-xs text-[#64748B]">PG & Redis online</span>
            </div>
          </Card>
        </div>

        {/* Workflows & Executions Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workflows Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Workflows</CardTitle>
                <CardDescription>Your visual automation pipelines</CardDescription>
              </div>
              <Link href="/workflows" className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 font-mono">
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <div className="mt-4">
              <EmptyState
                icon={Workflow}
                title="No workflows created yet"
                description="Design your first automated workflow by connecting triggers, API nodes, and condition branches."
                actionLabel="Create Workflow"
                actionHref="/workflows"
              />
            </div>
          </Card>

          {/* Recent Executions Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Telemetry from triggered runs</CardDescription>
              </div>
              <Link href="/executions" className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 font-mono">
                <span>Audit logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <div className="mt-4">
              <EmptyState
                icon={PlayCircle}
                title="No executions recorded"
                description="Workflows execute asynchronously via BullMQ workers. Telemetry and node logs will appear here upon first execution."
                actionLabel="Explore Workflows"
                actionHref="/workflows"
              />
            </div>
          </Card>
        </div>

        {/* Quick Setup Guide Card */}
        <Card className="border-[#22D3EE]/20 bg-gradient-to-r from-[#172D43]/90 to-[#101827]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="cyan" dot>Foundation Initialized</Badge>
                <span className="text-xs font-mono text-[#64748B]">Phase 1 Active</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Ready to construct your first automated graph?</h3>
              <p className="text-xs text-[#94A3B8] max-w-xl">
                Nexora enforces strict zero-eval execution safety, topological DAG cycle validation, and AES-256-GCM credential encryption.
              </p>
            </div>
            <Link
              href="/workflows"
              className="inline-flex items-center gap-2 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#101827] font-semibold text-xs px-4 py-2 rounded-lg transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Canvas</span>
            </Link>
          </div>
        </Card>
      </main>
    </>
  );
}
