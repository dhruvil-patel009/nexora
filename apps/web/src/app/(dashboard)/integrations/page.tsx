"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Globe,
  Webhook,
  Send,
  GitBranch,
  MessageSquare,
  Terminal,
  ExternalLink,
  Plus,
  Lock,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";
import Link from "next/link";

interface IntegrationConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  status: string;
  badgeVariant: "success" | "cyan" | "default";
  defaultKeyName: string;
  defaultType: "API_KEY" | "BEARER_TOKEN" | "CUSTOM_HEADER";
  placeholder: string;
  guideUrl?: string;
}

const availableIntegrations: IntegrationConfig[] = [
  {
    id: "webhook",
    name: "Webhook Trigger",
    category: "Triggers",
    description: "Receive inbound HTTP POST requests with unguessable 32-byte tokens, rate limits, and JSON body parsing.",
    icon: Webhook,
    status: "Active & Built-in",
    badgeVariant: "success",
    defaultKeyName: "WEBHOOK_SECRET",
    defaultType: "API_KEY",
    placeholder: "No secret needed - generated per workflow",
  },
  {
    id: "http",
    name: "HTTP Request Action",
    category: "Network / APIs",
    description: "Send HTTP requests (GET, POST, PUT, PATCH, DELETE) with DNS-level SSRF guards and secret interpolation.",
    icon: Globe,
    status: "Active & Built-in",
    badgeVariant: "success",
    defaultKeyName: "CUSTOM_API_KEY",
    defaultType: "API_KEY",
    placeholder: "Paste any API token or Bearer key...",
  },
  {
    id: "slack",
    name: "Slack Incoming Webhook",
    category: "Notifications",
    description: "Post real-time messages and incident alerts directly to Slack channels via incoming webhook URLs.",
    icon: MessageSquare,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "SLACK_WEBHOOK_URL",
    defaultType: "CUSTOM_HEADER",
    placeholder: "https://hooks.slack.com/services/T00/B00/XXXX",
  },
  {
    id: "github",
    name: "GitHub API",
    category: "Developer Tools",
    description: "Trigger repository workflows, create issues, or dispatch events using GitHub Personal Access Tokens.",
    icon: GitBranch,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "GITHUB_TOKEN",
    defaultType: "BEARER_TOKEN",
    placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "discord",
    name: "Discord Webhook",
    category: "Notifications",
    description: "Send rich embed notifications to Discord community channels via webhook URLs.",
    icon: Send,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "DISCORD_WEBHOOK_URL",
    defaultType: "CUSTOM_HEADER",
    placeholder: "https://discord.com/api/webhooks/...",
  },
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [secretValue, setSecretValue] = useState("");
  const [keyName, setKeyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openConnectModal = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setKeyName(integration.defaultKeyName);
    setSecretValue("");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration || !secretValue.trim() || !keyName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          name: keyName.trim().toUpperCase(),
          type: selectedIntegration.defaultType,
          value: secretValue.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to store credential");
      }

      setSuccessMessage(`Secret "${keyName}" encrypted and vaulted successfully!`);
      setTimeout(() => {
        setSelectedIntegration(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to vault credential");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-xs font-semibold text-white">Zero-Friction Integration Model</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Nexora does not simulate fake connections. Any third-party service (Slack, GitHub, Stripe, Discord) connects directly via the generic <span className="font-mono text-[#22D3EE]">HTTP Request</span> node or <span className="font-mono text-[#22D3EE]">Webhook Trigger</span> paired with encrypted credentials stored in your <span className="font-mono text-[#22D3EE]">Credentials Vault</span>.
            </p>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isBuiltIn = integration.id === "webhook" || integration.id === "http";

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

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#64748B]">{integration.category}</span>
                  {isBuiltIn ? (
                    <Link href="/workflows">
                      <Button variant="ghost" size="sm" className="text-xs text-[#22D3EE] gap-1 px-2">
                        <span>Use in Canvas</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openConnectModal(integration)}
                      className="text-xs gap-1 border-[#22D3EE]/30 hover:border-[#22D3EE]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#22D3EE]" />
                      <span>Vault Secret</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Vault Credential Modal for Integrations */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#101827] border border-[#2A4365] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#172D43]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Connect {selectedIntegration.name}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">Stores encrypted in Credentials Vault</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredential} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center gap-2 text-xs text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl flex items-center gap-2 text-xs text-[#22C55E]">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Credential Identifier</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22D3EE]"
                  required
                />
                <p className="text-[10px] text-[#64748B]">
                  Reference in HTTP Request nodes: <span className="font-mono text-[#22D3EE]">{`{{credentials.${keyName}}}`}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Secret Token or Webhook URL</label>
                <input
                  type="password"
                  placeholder={selectedIntegration.placeholder}
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
                  required
                />
                <p className="text-[10px] text-[#64748B]">
                  Encrypted immediately with AES-256-GCM. Plaintext is never saved unencrypted.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1E293B]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Vault Secret</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
