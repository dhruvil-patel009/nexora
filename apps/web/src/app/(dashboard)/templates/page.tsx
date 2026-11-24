"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  Webhook,
  Globe,
  GitFork,
  Clock,
  Terminal,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { WorkflowGraphDefinition } from "@nexora/shared";

interface WorkflowTemplate {
  id: string;
  name: string;
  category: "Sales & Marketing" | "DevOps & Monitoring" | "Developer Tools" | "Customer Support" | "Security";
  description: string;
  badge?: string;
  nodeTypes: Array<{ label: string; icon: any; color: string }>;
  definition: WorkflowGraphDefinition;
}

const templates: WorkflowTemplate[] = [
  {
    id: "lead-vip-routing",
    name: "Inbound Lead Intake & VIP Routing",
    category: "Sales & Marketing",
    badge: "Popular",
    description: "Ingests customer webhook payloads, branches on lead score, and dispatches VIP notifications to CRM or Slack.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "HTTP POST", icon: Globe, color: "#38BDF8" },
      { label: "Logger", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "webhook_lead",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Lead Webhook", config: {} },
        },
        {
          id: "check_score",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Check: Score > 80",
            config: { variable: "trigger.score", operator: "greater_than", value: "80" },
          },
        },
        {
          id: "notify_crm",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Dispatch VIP to CRM",
            config: {
              method: "POST",
              url: "https://api.example.com/crm/leads",
              headers: { "Content-Type": "application/json" },
              body: { email: "{{trigger.email}}", tier: "VIP", score: "{{trigger.score}}" },
            },
          },
        },
        {
          id: "log_standard",
          type: "logger",
          position: { x: 520, y: 380 },
          data: {
            label: "Log Standard Lead",
            config: { message: "Standard lead recorded: {{trigger.email}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "webhook_lead", target: "check_score", animated: true },
        { id: "e2", source: "check_score", target: "notify_crm", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_score", target: "log_standard", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "api-health-monitor",
    name: "API Uptime Monitor & Incident Alert",
    category: "DevOps & Monitoring",
    badge: "Recommended",
    description: "Performs HTTP health checks on external APIs, verifies HTTP 200 response, and triggers alerts on degradation.",
    nodeTypes: [
      { label: "Manual Trigger", icon: Terminal, color: "#22D3EE" },
      { label: "HTTP GET", icon: Globe, color: "#38BDF8" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Slack Alert", icon: Globe, color: "#EF4444" },
    ],
    definition: {
      nodes: [
        {
          id: "manual_poll",
          type: "manual-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Trigger Health Check", config: {} },
        },
        {
          id: "http_ping",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "GET /health Endpoint",
            config: { method: "GET", url: "https://api.github.com" },
          },
        },
        {
          id: "check_http_200",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Verify HTTP 200",
            config: { variable: "steps.http_ping.status", operator: "equals", value: "200" },
          },
        },
        {
          id: "log_healthy",
          type: "logger",
          position: { x: 180, y: 490 },
          data: {
            label: "Log Healthy",
            config: { message: "Service is fully operational with HTTP 200." },
          },
        },
        {
          id: "post_alert",
          type: "http-request",
          position: { x: 520, y: 490 },
          data: {
            label: "Alert On-Call Webhook",
            config: {
              method: "POST",
              url: "https://api.example.com/alerts",
              body: { text: "⚠️ Health check failed! Status: {{steps.http_ping.status}}" },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "manual_poll", target: "http_ping", animated: true },
        { id: "e2", source: "http_ping", target: "check_http_200", animated: true },
        { id: "e3", source: "check_http_200", target: "log_healthy", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_http_200", target: "post_alert", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "github-issue-router",
    name: "GitHub Issues to Discord Dispatcher",
    category: "Developer Tools",
    description: "Receives GitHub webhook events, inspects issue action type, and posts formatted notifications to Discord channels.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Discord POST", icon: Globe, color: "#38BDF8" },
    ],
    definition: {
      nodes: [
        {
          id: "github_webhook",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "GitHub Webhook Listener", config: {} },
        },
        {
          id: "check_opened",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Action == opened",
            config: { variable: "trigger.action", operator: "equals", value: "opened" },
          },
        },
        {
          id: "discord_post",
          type: "http-request",
          position: { x: 220, y: 380 },
          data: {
            label: "Post to Discord Channel",
            config: {
              method: "POST",
              url: "https://discord.com/api/webhooks/example",
              body: { content: "New Issue Opened: {{trigger.issue.title}} by {{trigger.sender.login}}" },
            },
          },
        },
        {
          id: "ignore_log",
          type: "logger",
          position: { x: 480, y: 380 },
          data: {
            label: "Log Ignored Action",
            config: { message: "Non-opened event ignored: {{trigger.action}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "github_webhook", target: "check_opened", animated: true },
        { id: "e2", source: "check_opened", target: "discord_post", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_opened", target: "ignore_log", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "delayed-autoresponder",
    name: "Delayed Auto-Responder & Pipeline Check",
    category: "Customer Support",
    description: "Introduces a controlled non-blocking pause before sending automated customer follow-ups and recording audit milestones.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Delay (3s)", icon: Clock, color: "#A855F7" },
      { label: "HTTP POST", icon: Globe, color: "#38BDF8" },
      { label: "Audit Log", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "inbound_ticket",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Support Request", config: {} },
        },
        {
          id: "safe_pause",
          type: "delay",
          position: { x: 350, y: 220 },
          data: { label: "Wait 3 Seconds", config: { durationSeconds: 3 } },
        },
        {
          id: "dispatch_reply",
          type: "http-request",
          position: { x: 350, y: 340 },
          data: {
            label: "Send Auto-Reply",
            config: {
              method: "POST",
              url: "https://api.example.com/support/reply",
              body: { ticketId: "{{trigger.id}}", message: "Your request has been received." },
            },
          },
        },
        {
          id: "audit_logger",
          type: "logger",
          position: { x: 350, y: 460 },
          data: {
            label: "Audit Milestone",
            config: { message: "Auto-responder completed for ticket: {{trigger.id}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "inbound_ticket", target: "safe_pause", animated: true },
        { id: "e2", source: "safe_pause", target: "dispatch_reply", animated: true },
        { id: "e3", source: "dispatch_reply", target: "audit_logger", animated: true },
      ],
    },
  },
];

const categories = [
  "All",
  "Sales & Marketing",
  "DevOps & Monitoring",
  "Developer Tools",
  "Customer Support",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = selectedCategory === "All" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    setCloningId(template.id);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      // 1. Create workflow
      const res = await fetch(`${apiUrl}/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          name: `${template.name}`,
          description: template.description,
        }),
      });

      if (!res.ok) throw new Error("Failed to create workflow from template");
      const created = await res.json();

      // 2. Save definition
      await fetch(`${apiUrl}/workflows/${created.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          definition: template.definition,
        }),
      });

      // 3. Open in canvas
      router.push(`/workflows/${created.id}`);
    } catch (err: any) {
      alert(`Error cloning template: ${err.message}`);
      setCloningId(null);
    }
  };

  return (
    <>
      <TopBar
        title="Workflow Templates Gallery"
        subtitle="Pre-configured DAG blueprints to accelerate your automation architecture."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Banner */}
        <div className="bg-[#172D43]/40 border border-[#8B5CF6]/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Production-Ready Blueprints</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
              Click <strong className="text-white">Use Template</strong> on any blueprint to clone a verified, DAG-validated automation directly into your workspace. Modify handles, secrets, or condition values directly in the canvas.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#22D3EE] text-[#101827] font-semibold"
                    : "bg-[#172D43]/40 text-[#94A3B8] hover:text-white border border-[#1E293B]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTemplates.map((template) => (
            <Card key={template.id} hoverEffect className="flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-[#22D3EE] uppercase tracking-wider">
                    {template.category}
                  </span>
                  {template.badge && (
                    <Badge variant={template.badge === "Popular" ? "cyan" : "violet"}>
                      {template.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">{template.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{template.description}</p>

                {/* Node Sequence Diagram */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block mb-1.5">
                    DAG Pipeline Sequence
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {template.nodeTypes.map((nt, idx) => {
                      const Icon = nt.icon;
                      return (
                        <React.Fragment key={idx}>
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#101827] border border-[#1E293B] text-[10px] font-mono text-white">
                            <Icon className="w-3 h-3" style={{ color: nt.color }} />
                            <span>{nt.label}</span>
                          </div>
                          {idx < template.nodeTypes.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-[#64748B]" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#64748B]">
                  {template.definition.nodes.length} Nodes • {template.definition.edges.length} Edges
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUseTemplate(template)}
                  isLoading={cloningId === template.id}
                  className="gap-1.5 text-xs"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
