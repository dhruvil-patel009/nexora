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
  Plus,
  Lock,
  X,
  Check,
  AlertCircle,
  Bot,
  CreditCard,
  Database,
  Mail,
  Smartphone,
  Bell,
  ShoppingBag,
  MessageCircle,
  Search,
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
  badgeVariant: "success" | "cyan" | "default" | "violet" | "warning";
  defaultKeyName: string;
  defaultType: "API_KEY" | "BEARER_TOKEN" | "CUSTOM_HEADER";
  placeholder: string;
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
    id: "openai",
    name: "OpenAI / LLM API",
    category: "AI & Machine Learning",
    description: "Query GPT models, generate embeddings, or run structured reasoning over inbound automation context.",
    icon: Bot,
    status: "Connect via Vault",
    badgeVariant: "violet",
    defaultKeyName: "OPENAI_API_KEY",
    defaultType: "BEARER_TOKEN",
    placeholder: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "stripe",
    name: "Stripe Payments & Billing",
    category: "E-Commerce & Payments",
    description: "Ingest checkout, subscription, and charge webhooks, or issue programmatic refunds and customer updates.",
    icon: CreditCard,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "STRIPE_SECRET_KEY",
    defaultType: "BEARER_TOKEN",
    placeholder: "sk_live_51M0xxxxxxxxxxxxxxxxxxx",
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
    id: "resend",
    name: "Resend Transactional Email",
    category: "Email & Marketing",
    description: "Send automated transactional emails, welcome drip sequences, and OTP notifications to customers.",
    icon: Mail,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "RESEND_API_KEY",
    defaultType: "BEARER_TOKEN",
    placeholder: "re_xxxxxxxxxxxxxxxxxxxxxxxx",
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
    description: "Send rich embed notifications and team alerts to Discord community channels via webhook URLs.",
    icon: Send,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "DISCORD_WEBHOOK_URL",
    defaultType: "CUSTOM_HEADER",
    placeholder: "https://discord.com/api/webhooks/...",
  },
  {
    id: "airtable",
    name: "Airtable REST API",
    category: "Databases & Sheets",
    description: "Create, query, and synchronize records in Airtable bases directly from workflow automation branches.",
    icon: Database,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "AIRTABLE_API_KEY",
    defaultType: "BEARER_TOKEN",
    placeholder: "patxxxxxxxxxxxxxxxx.xxxxxxxxxx",
  },
  {
    id: "twilio",
    name: "Twilio SMS & WhatsApp",
    category: "Telephony & Alerts",
    description: "Dispatch automated SMS alerts and high-priority on-call incident notifications via Twilio.",
    icon: Smartphone,
    status: "Connect via Vault",
    badgeVariant: "warning",
    defaultKeyName: "TWILIO_AUTH_TOKEN",
    defaultType: "CUSTOM_HEADER",
    placeholder: "Your Twilio Auth Token or Account SID",
  },
  {
    id: "pagerduty",
    name: "PagerDuty Event API v2",
    category: "DevOps & Monitoring",
    description: "Trigger, acknowledge, and resolve high-severity on-call incidents programmatically from workflow graphs.",
    icon: Bell,
    status: "Connect via Vault",
    badgeVariant: "warning",
    defaultKeyName: "PAGERDUTY_ROUTING_KEY",
    defaultType: "CUSTOM_HEADER",
    placeholder: "Your 32-character PagerDuty Integration Key",
  },
  {
    id: "shopify",
    name: "Shopify Admin API",
    category: "E-Commerce & Payments",
    description: "Synchronize inventory, automate order tags, and trigger custom fulfillment webhooks.",
    icon: ShoppingBag,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "SHOPIFY_ACCESS_TOKEN",
    defaultType: "CUSTOM_HEADER",
    placeholder: "shpat_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "telegram",
    name: "Telegram Bot API",
    category: "Chatbots & Messaging",
    description: "Send automated messages, broadcast alerts, and interact with private or group Telegram channels.",
    icon: MessageCircle,
    status: "Connect via Vault",
    badgeVariant: "cyan",
    defaultKeyName: "TELEGRAM_BOT_TOKEN",
    defaultType: "API_KEY",
    placeholder: "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ",
  },
];

const categories = [
  "All",
  "Triggers",
  "AI & Machine Learning",
  "Notifications",
  "E-Commerce & Payments",
  "Email & Marketing",
  "Developer Tools",
  "Databases & Sheets",
  "DevOps & Monitoring",
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [secretValue, setSecretValue] = useState("");
  const [keyName, setKeyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredIntegrations = availableIntegrations.filter((intg) => {
    const matchesCat = selectedCategory === "All" || intg.category === selectedCategory;
    const matchesSearch =
      intg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            <h2 className="text-xs font-semibold text-white">Direct Zero-Trust Connectivity</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Nexora connects directly to any external API using the generic <span className="font-mono text-[#22D3EE]">HTTP Request</span> node or <span className="font-mono text-[#22D3EE]">Webhook Trigger</span> paired with encrypted secrets vaulted with <span className="font-mono text-[#22D3EE]">AES-256-GCM</span>. Credentials resolve in worker memory and are permanently redacted from execution logs.
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
              placeholder="Search integrations..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
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
