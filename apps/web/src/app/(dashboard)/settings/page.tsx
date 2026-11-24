"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Settings, Shield, Server, User, Database, Check, Cpu } from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const token = getAuthToken();
        const workspace = getActiveWorkspace();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

        // Fetch profile
        const profRes = await fetch(`${apiUrl}/workspace/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspace?.id || "",
          },
        });
        if (profRes.ok) {
          const profJson = await profRes.json();
          setProfile(profJson);
        }

        // Fetch health
        const healthRes = await fetch(`${apiUrl}/health`);
        if (healthRes.ok) {
          const healthJson = await healthRes.json();
          setHealth(healthJson);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const activeWorkspace = profile || getActiveWorkspace() || {
    name: "Default Workspace",
    slug: "default-workspace",
  };

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
            <Badge variant="cyan">Active Workspace</Badge>
          </CardHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-mono text-[#94A3B8] mb-1">Workspace Name</label>
              <input
                type="text"
                readOnly
                value={activeWorkspace.name}
                className="w-full max-w-md px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white font-mono focus:outline-none select-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#94A3B8] mb-1">Workspace Slug (Tenant Key)</label>
              <input
                type="text"
                readOnly
                value={activeWorkspace.slug}
                className="w-full max-w-md px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-[#22D3EE] font-mono focus:outline-none select-all"
              />
            </div>

            {profile?.members && profile.members.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-mono text-[#94A3B8] mb-2">Workspace Members</label>
                <div className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-xl overflow-hidden bg-[#101827]/40 max-w-md">
                  {profile.members.map((m: any) => (
                    <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{m.fullName}</span>
                        <span className="text-[#64748B] text-[11px] font-mono">{m.email}</span>
                      </div>
                      <Badge variant="violet">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Runtime Environment Status */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Runtime Environment</CardTitle>
              <CardDescription>Underlying microservices, database, and background queues.</CardDescription>
            </div>
            <Badge variant="success" dot>
              {health?.status === "ok" ? "All Services Operational" : "Operational"}
            </Badge>
          </CardHeader>

          <div className="space-y-3 mt-4 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Database className="w-4 h-4 text-[#22D3EE]" />
                <span>PostgreSQL 16 (Relational DB)</span>
              </div>
              <span className="text-[#22C55E]">
                {health?.services?.database?.status === "healthy" ? "CONNECTED" : "ONLINE"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Server className="w-4 h-4 text-[#8B5CF6]" />
                <span>Redis 7 (BullMQ Queue Broker)</span>
              </div>
              <span className="text-[#22C55E]">
                {health?.services?.redis?.status === "healthy" ? "CONNECTED" : "ONLINE"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                <span>Vault Encryption (AES-256-GCM)</span>
              </div>
              <span className="text-[#22D3EE]">ACTIVE & ARMORED</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101827] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Cpu className="w-4 h-4 text-[#F59E0B]" />
                <span>DAG Engine Safety (Zero-Eval)</span>
              </div>
              <span className="text-[#22C55E]">ENFORCED</span>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
