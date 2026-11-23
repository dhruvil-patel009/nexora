"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayCircle, Search, RefreshCw, Clock, ArrowRight, X } from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

interface ExecutionItem {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: number;
  triggerType: "MANUAL" | "WEBHOOK" | "SCHEDULE";
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  durationMs?: number;
  errorSummary?: string;
  createdAt: string;
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<any | null>(null);

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/executions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (err) {
      console.error("Failed to fetch executions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = async (id: string) => {
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/executions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedExecution(data);
      }
    } catch (err) {
      console.error("Failed to fetch execution details:", err);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge variant="success" dot>Succeeded</Badge>;
      case "FAILED":
        return <Badge variant="error" dot>Failed</Badge>;
      case "RUNNING":
        return <Badge variant="cyan" dot>Running</Badge>;
      default:
        return <Badge variant="warning" dot>Queued</Badge>;
    }
  };

  return (
    <>
      <TopBar
        title="Executions History"
        subtitle="Inspect execution telemetry, node step durations, and error summaries."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-[#172D43]/40 p-3 rounded-xl border border-[#1E293B]">
          <span className="text-xs font-mono font-semibold text-[#94A3B8]">
            Recorded Executions ({executions.length})
          </span>
          <button
            onClick={fetchExecutions}
            className="flex items-center gap-1.5 bg-[#101827] border border-[#2A4365] hover:border-[#22D3EE] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Executions Table */}
        <Card className="p-0 overflow-hidden">
          {executions.length === 0 && !isLoading ? (
            <div className="p-8">
              <EmptyState
                icon={PlayCircle}
                title="No executions recorded"
                description="Workflows execute asynchronously via BullMQ workers. Telemetry and node logs will appear here upon first execution."
                actionLabel="View Workflows"
                actionHref="/workflows"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#172D43]/60 border-b border-[#1E293B] font-mono uppercase text-[#94A3B8]">
                  <tr>
                    <th className="px-6 py-3">Execution ID</th>
                    <th className="px-6 py-3">Workflow</th>
                    <th className="px-6 py-3">Trigger</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Started At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {executions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-[#172D43]/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-[#22D3EE]">
                        #{ex.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {ex.workflowName}
                        <span className="ml-1.5 text-[10px] font-mono text-[#64748B]">v{ex.workflowVersion}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#94A3B8]">
                        {ex.triggerType}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ex.status)}
                      </td>
                      <td className="px-6 py-4 font-mono text-[#94A3B8]">
                        {ex.durationMs !== null ? `${ex.durationMs}ms` : "-"}
                      </td>
                      <td className="px-6 py-4 text-[#64748B] font-mono text-[11px]">
                        {new Date(ex.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewDetails(ex.id)}
                          className="inline-flex items-center gap-1 text-xs text-[#22D3EE] hover:underline font-mono"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* Execution Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-[#172D43] border border-[#2A4365] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white">Run #{selectedExecution.id.slice(0, 8)}</h3>
                {getStatusBadge(selectedExecution.status)}
                {selectedExecution.durationMs !== null && (
                  <span className="text-xs font-mono text-[#94A3B8]">{selectedExecution.durationMs}ms</span>
                )}
              </div>
              <button
                onClick={() => setSelectedExecution(null)}
                className="p-1 rounded text-[#64748B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#94A3B8] block">Step Executions:</span>
                <div className="space-y-2">
                  {selectedExecution.nodeExecutions?.map((step: any, i: number) => (
                    <div key={step.id} className="p-3 bg-[#101827] rounded-lg border border-[#1E293B] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          #{i + 1} {step.nodeId} ({step.nodeType})
                        </span>
                        <span className="text-[10px] font-mono text-[#22C55E]">
                          {step.durationMs}ms
                        </span>
                      </div>
                      <pre className="p-2 rounded bg-[#172D43]/40 border border-[#1E293B] text-[10px] font-mono text-[#22D3EE] overflow-x-auto max-h-24">
                        {JSON.stringify(step.outputData || {}, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
