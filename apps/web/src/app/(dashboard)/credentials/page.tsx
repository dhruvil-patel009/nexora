"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

interface CredentialItem {
  id: string;
  name: string;
  type: "API_KEY" | "BEARER_TOKEN" | "BASIC_AUTH" | "CUSTOM_HEADER";
  maskedPreview: string;
  createdAt: string;
  updatedAt: string;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<CredentialItem["type"]>("API_KEY");
  const [formValue, setFormValue] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/credentials`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formValue.trim()) return;

    setIsSubmitting(true);
    setError(null);

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
          name: formName.trim().toUpperCase(),
          type: formType,
          value: formValue.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create credential");
      }

      // Reset form and reload
      setFormName("");
      setFormValue("");
      setIsModalOpen(false);
      await fetchCredentials();
    } catch (err: any) {
      setError(err.message || "Failed to store credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/credentials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      if (res.ok) {
        setDeleteId(null);
        await fetchCredentials();
      }
    } catch (err) {
      console.error("Failed to delete credential:", err);
    }
  };

  const copyUsageTag = async (name: string) => {
    const text = `{{credentials.${name}}}`;
    await navigator.clipboard.writeText(text);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const getTypeBadgeVariant = (type: CredentialItem["type"]): "cyan" | "violet" | "warning" | "muted" | "default" => {
    switch (type) {
      case "API_KEY":
        return "cyan";
      case "BEARER_TOKEN":
        return "violet";
      case "BASIC_AUTH":
        return "warning";
      case "CUSTOM_HEADER":
        return "muted";
      default:
        return "default";
    }
  };

  return (
    <>
      <TopBar
        title="Credentials Vault"
        subtitle="Manage encrypted API keys, bearer tokens, and secrets for workflow HTTP requests."
        action={{
          label: "Add Credential",
          onClick: () => {
            setError(null);
            setIsModalOpen(true);
          },
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

        {/* Credentials List Shell */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">
                Vault Credentials ({credentials.length})
              </span>
            </div>
            <span className="text-xs font-mono text-[#64748B]">Workspace Isolated</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#22D3EE] animate-spin mb-2" />
              <span className="text-xs font-mono text-[#94A3B8]">Loading encrypted vault...</span>
            </div>
          ) : credentials.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={KeyRound}
                title="No credentials stored"
                description="Store API keys, bearer tokens, or custom HTTP headers securely to reference them in HTTP Request workflow nodes using {{credentials.name}} syntax."
                actionLabel="Create Credential"
                onAction={() => {
                  setError(null);
                  setIsModalOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#101827]/60 text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Secret Preview</th>
                    <th className="px-6 py-3.5">Usage Placeholder</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {credentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-[#172D43]/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
                            <KeyRound className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-mono font-semibold text-white tracking-wide">
                            {cred.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getTypeBadgeVariant(cred.type)}>
                          {cred.type.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[#64748B] select-none tracking-widest text-xs">
                          {cred.maskedPreview}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyUsageTag(cred.name)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1120] border border-[#1E293B] text-[11px] font-mono text-[#22D3EE] hover:border-[#22D3EE]/40 transition-colors group"
                          title="Click to copy usage tag"
                        >
                          <span>{`{{credentials.${cred.name}}}`}</span>
                          {copiedName === cred.name ? (
                            <Check className="w-3 h-3 text-[#22C55E]" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#64748B] group-hover:text-[#22D3EE]" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-[#94A3B8] font-mono text-[11px]">
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {deleteId === cred.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-[#EF4444] font-medium">Delete?</span>
                            <button
                              onClick={() => handleDelete(cred.id)}
                              className="px-2 py-0.5 rounded bg-[#EF4444] text-white text-[11px] font-semibold hover:bg-[#DC2626]"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] text-[11px] hover:text-white"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(cred.id)}
                            className="text-[#64748B] hover:text-[#EF4444] p-1.5 rounded hover:bg-[#1E293B] transition-colors"
                            title="Delete credential"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* Add Credential Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#101827] border border-[#2A4365] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#172D43]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Vault New Credential</h3>
                  <p className="text-[11px] text-[#94A3B8]">Encrypted at rest with AES-256-GCM</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center gap-2 text-xs text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Credential Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. GITHUB_TOKEN or STRIPE_API_KEY"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
                  required
                />
                <p className="text-[10px] text-[#64748B]">
                  Used as reference in workflow nodes: <span className="font-mono text-[#22D3EE]">{`{{credentials.${formName || "NAME"}}}`}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Credential Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22D3EE]"
                >
                  <option value="API_KEY">API Key</option>
                  <option value="BEARER_TOKEN">Bearer Token</option>
                  <option value="BASIC_AUTH">Basic Auth (user:password)</option>
                  <option value="CUSTOM_HEADER">Custom Header Value</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Secret Value</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Paste your sensitive API key or token..."
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 pr-10 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-white"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Plaintext is encrypted immediately. It will never be visible again.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1E293B]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
