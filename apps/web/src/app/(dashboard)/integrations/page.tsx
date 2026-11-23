import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Globe, Webhook, Send, GitBranch, MessageSquare, Terminal, ExternalLink } from "lucide-react";

const availableIntegrations = [
  {
    name: "Webhook Trigger",
    category: "Triggers",
    description: "Receive inbound HTTP POST requests with unguessable tokens and payload schemas.",
    icon: Webhook,
    status: "Available",
    badgeVariant: "success" as const,
  },
  {
    name: "HTTP Request",
    category: "Network / APIs",
    description: "Send HTTP requests (GET, POST, PUT, PATCH, DELETE) with SSRF safety and credential injection.",
    icon: Globe,
    status: "Available",
    badgeVariant: "success" as const,
  },
  {
    name: "Slack Webhook",
    category: "Notifications",
    description: "Post structured messages and incident alerts directly to Slack channels via incoming webhooks.",
    icon: MessageSquare,
    status: "Available via HTTP Node",
    badgeVariant: "cyan" as const,
  },
  {
    name: "GitHub API",
    category: "Developer Tools",
    description: "Trigger automations on pull requests, issues, or releases using personal access tokens.",
    icon: GitBranch,
    status: "Available via HTTP Node",
    badgeVariant: "cyan" as const,
  },
  {
    name: "Discord Webhook",
    category: "Notifications",
    description: "Send formatted embed messages to Discord community channels.",
    icon: Send,
    status: "Available via HTTP Node",
    badgeVariant: "cyan" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <TopBar
        title="Integrations Registry"
        subtitle="Supported connectivity and external services for your automation workflows."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Notice on honest connectivity */}
        <div className="bg-[#172D43]/50 border border-[#22D3EE]/20 rounded-xl p-4 flex items-start gap-3">
          <Terminal className="w-5 h-5 text-[#22D3EE] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-white">Honest Integration Model</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Nexora does not simulate fake connections. Any third-party service (Slack, GitHub, Stripe, Discord) can be connected immediately using the generic <span className="font-mono text-[#22D3EE]">HTTP Request</span> node paired with stored credentials from your <span className="font-mono text-[#22D3EE]">Credentials Vault</span>.
            </p>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.name} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#101827] border border-[#2A4365] flex items-center justify-center text-[#22D3EE]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={integration.badgeVariant} dot>
                      {integration.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{integration.name}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{integration.description}</p>
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>{integration.category}</span>
                  <span className="text-[#22D3EE]">Built-in Node</span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
