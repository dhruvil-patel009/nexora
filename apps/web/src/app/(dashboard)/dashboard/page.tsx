"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Workflow,
  PlayCircle,
  KeyRound,
  ArrowUpRight,
  Plus,
  Activity,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Radio,
} from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

interface AnalyticsData {
  metrics: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    succeededExecutions: number;
    failedExecutions: number;
    successRate: number;
    totalCredentials: number;
  };
  recentExecutions: Array<{
    id: string;
    workflowId: string;
    workflowName: string;
    triggerType: string;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const token = getAuthToken();
        const workspace = getActiveWorkspace();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

        const res = await fetch(`${apiUrl}/workspace/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspace?.id || "",
          },
        });

        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load workspace analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTelemetry();
  }, []);

  const metrics = data?.metrics || {
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    succeededExecutions: 0,
    failedExecutions: 0,
    successRate: 100,
    totalCredentials: 0,
  };

  const recentExecutions = data?.recentExecutions || [];

  return (
    <>
      <TopBar
        title="Workspace Overview"
        subtitle="Real-time telemetry, active workflows, and execution audit history."
        action={{
          label: "New Workflow",
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
              <span className="text-2xl font-bold text-white font-mono">{metrics.totalWorkflows}</span>
              <span className="text-xs text-[#22D3EE] font-mono">({metrics.activeWorkflows} live)</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Total Executions</span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{metrics.totalExecutions}</span>
              <span className="text-xs text-[#64748B]">recorded runs</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Success Rate</span>
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{metrics.successRate}%</span>
              <span className="text-xs text-[#22C55E]">reliability</span>
            </div>
          </Card>

          <Card hoverEffect>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Vaulted Secrets</span>
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{metrics.totalCredentials}</span>
              <span className="text-xs text-[#94A3B8]">AES-256-GCM</span>
            </div>
          </Card>
        </div>

        {/* Action Hub & Recent Runs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions & Exploration */}
          <div className="space-y-4 lg:col-span-1">
            <Card className="space-y-3 bg-gradient-to-br from-[#172D43]/60 to-[#101827]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">AI Workflow Creator</h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Describe your desired automation in plain language. Nexora will synthesize a complete, cycle-checked DAG graph.
              </p>
              <Link href="/workflows" className="block pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white">
                  <span>Open AI Generator</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Card>

            <Card className="space-y-3 bg-gradient-to-br from-[#172D43]/60 to-[#101827]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Workflow Templates</h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Browse pre-built templates for Lead Routing, GitHub Webhooks, API Uptime, and Customer Auto-Responders.
              </p>
              <Link href="/templates" className="block pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE] hover:text-white">
                  <span>Browse Templates</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Card>
          </div>

          {/* Recent Executions Telemetry Feed */}
          <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#172D43]/20">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#22D3EE]" />
                  <h3 className="text-sm font-semibold text-white">Recent Workflow Executions</h3>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Audit Logs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentExecutions.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={PlayCircle}
                    title="No executions recorded yet"
                    description="Run a workflow manually or trigger a published webhook to view live execution telemetry and duration logs."
                    actionLabel="Explore Workflows"
                    actionHref="/workflows"
                  />
                </div>
              ) : (
                <div className="divide-y divide-[#1E293B]">
                  {recentExecutions.map((exec) => (
                    <div
                      key={exec.id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-[#172D43]/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {exec.status === "SUCCEEDED" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        ) : exec.status === "FAILED" ? (
                          <XCircle className="w-4 h-4 text-[#EF4444]" />
                        ) : (
                          <Radio className="w-4 h-4 text-[#22D3EE] animate-pulse" />
                        )}
                        <div>
                          <span className="text-xs font-semibold text-white block leading-tight">
                            {exec.workflowName}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            Trigger: {exec.triggerType}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            exec.status === "SUCCEEDED"
                              ? "success"
                              : exec.status === "FAILED"
                              ? "error"
                              : "cyan"
                          }
                        >
                          {exec.status}
                        </Badge>
                        <span className="text-[11px] font-mono text-[#64748B]">
                          {new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#1E293B] bg-[#101827]/40 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>BullMQ Queue Processor</span>
              <span className="text-[#22C55E]">Healthy & Listening</span>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
