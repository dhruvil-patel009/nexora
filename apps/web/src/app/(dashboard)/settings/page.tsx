import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Settings, Shield, Server, User, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <TopBar
        title="Settings & Workspace Configuration"
        subtitle="Manage workspace profile, security credentials, and runtime parameters."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-4xl">
        {/* Workspace Details */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Workspace Profile</CardTitle>
              <CardDescription>Multi-tenant organization boundary and owner permissions.</CardDescription>
            </div>
            <Badge variant="cyan">Active</Badge>
          </CardHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-mono text-[#94A3B8] mb-1">Workspace Name</label>
              <input
                type="text"
                readOnly
                value="Default Workspace"
                className="w-full max-w-md px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#94A3B8] mb-1">Workspace Slug</label>
              <input
                type="text"
                readOnly
                value="default-workspace"
                className="w-full max-w-md px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-[#64748B] font-mono focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Runtime Environment Status */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Runtime Environment</CardTitle>
              <CardDescription>Underlying microservices, database, and background queues.</CardDescription>
            </div>
            <Badge variant="success" dot>Operational</Badge>
          </CardHeader>

          <div className="space-y-3 mt-4 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Database className="w-4 h-4 text-[#22D3EE]" />
                <span>PostgreSQL 16 (Prisma ORM)</span>
              </div>
              <span className="text-[#22C55E]">Connected (:5433)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Server className="w-4 h-4 text-[#8B5CF6]" />
                <span>Redis 7 (BullMQ Engine)</span>
              </div>
              <span className="text-[#22C55E]">Connected (:6379)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                <span>Vault Encryption</span>
              </div>
              <span className="text-white">AES-256-GCM</span>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
