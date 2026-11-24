"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Workflow, Search, Plus, Trash2, ArrowRight, X, AlertCircle, Sparkles } from "lucide-react";
import { AiGeneratorModal } from "@/components/canvas/AiGeneratorModal";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  currentVersion: number;
  nodeCount: number;
  edgeCount: number;
  executionCount: number;
  updatedAt: string;
}

function WorkflowsContent() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const url = new URL(`${apiUrl}/workflows`);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create workflow");
      }

      setName("");
      setDescription("");
      setIsModalOpen(false);
      fetchWorkflows();
    } catch (err: any) {
      setError(err.message || "Failed to create workflow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete workflow "${name}"?`)) return;

    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      await fetch(`${apiUrl}/workflows/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
      });

      fetchWorkflows();
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    }
  };

  return (
    <>
      <TopBar
        title="Workflows"
        subtitle="Manage and orchestrate visual automation graphs."
        action={{
          label: "New Workflow",
          onClick: () => setIsModalOpen(true),
        }}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#172D43]/40 p-3 rounded-xl border border-[#1E293B]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows by name..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="gap-1.5 border-[#8B5CF6]/40 text-[#A78BFA] hover:text-white hover:border-[#8B5CF6] text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Generate with AI</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Workflow</span>
            </Button>
          </div>
        </div>

        {/* Workflows List or Empty State */}
        {workflows.length === 0 && !isLoading ? (
          <Card className="p-8">
            <EmptyState
              icon={Workflow}
              title="No workflows in this workspace"
              description="Start automating repetitive processes by building your first visual workflow with drag-and-drop triggers, API requests, and conditional branching."
              actionLabel="Create Your First Workflow"
              onAction={() => setIsModalOpen(true)}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <Card key={wf.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE]">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <Badge variant={wf.status === "ACTIVE" ? "success" : "cyan"} dot>
                        {wf.status}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkflow(wf.id, wf.name)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      title="Delete workflow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{wf.name}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">
                    {wf.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                  <div className="text-[11px] font-mono text-[#64748B] space-x-2">
                    <span>{wf.nodeCount} nodes</span>
                    <span>•</span>
                    <span>v{wf.currentVersion}</span>
                  </div>
                  <Link
                    href={`/workflows/${wf.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE] hover:text-white transition-colors"
                  >
                    <span>Edit Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Workflow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#172D43] border border-[#2A4365] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
              <h3 className="text-base font-bold text-white">Create New Workflow</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#64748B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2 text-xs text-[#EF4444]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Workflow Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sync Orders to Slack"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what this automation graph does..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
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
                  isLoading={isCreating}
                >
                  Create & Launch Canvas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Workflow Generator Modal */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={() => fetchWorkflows()}
      />
    </>
  );
}

export default function WorkflowsPage() {
  return <WorkflowsContent />;
}
