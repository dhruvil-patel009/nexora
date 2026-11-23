import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KeyRound, ShieldCheck, Lock, Plus } from "lucide-react";

export default function CredentialsPage() {
  return (
    <>
      <TopBar
        title="Credentials Vault"
        subtitle="Manage encrypted API keys, bearer tokens, and secrets for workflow HTTP requests."
        action={{
          label: "Add Credential",
          onClick: undefined,
        }}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Security Assurance Banner */}
        <div className="bg-[#172D43]/40 border border-[#2A4365] rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-white">Zero-Trust Credential Security</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              All credentials are encrypted at rest using <span className="font-mono text-[#22D3EE]">AES-256-GCM</span> with unique initialization vectors (IVs). Secrets are never printed in execution logs, never stored inside workflow definitions, and never returned to the frontend after creation.
            </p>
          </div>
        </div>

        {/* Credentials List Shell with Honest Empty State */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">Vault Credentials (0)</span>
            </div>
            <span className="text-xs font-mono text-[#64748B]">Workspace Isolated</span>
          </div>

          <div className="p-8">
            <EmptyState
              icon={KeyRound}
              title="No credentials stored"
              description="Store API keys, bearer tokens, or custom HTTP headers securely to reference them in HTTP Request workflow nodes using {{credentials.name}} syntax."
              actionLabel="Create Credential"
            />
          </div>
        </Card>
      </main>
    </>
  );
}
