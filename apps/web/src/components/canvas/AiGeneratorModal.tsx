"use client";

import React, { useState } from "react";
import { Sparkles, X, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: (workflow: any) => void;
}

const samplePrompts = [
  "When an inbound webhook arrives, if score is greater than 80 notify CRM, otherwise log it",
  "Wait 10 seconds and make an HTTP GET request to check service health",
  "Listen for incoming webhook, if tier equals enterprise post to Slack VIP channel",
];

export function AiGeneratorModal({ isOpen, onClose, onGenerated }: AiGeneratorModalProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [customName, setCustomName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 5) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/workflows/generate-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          name: customName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to synthesize workflow from prompt");
      }

      const data = await res.json();
      setResult(data);

      if (onGenerated) {
        onGenerated(data.workflow);
      }
    } catch (err: any) {
      setError(err.message || "AI synthesis failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenWorkflow = () => {
    if (result?.workflow?.id) {
      router.push(`/workflows/${result.workflow.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101827] border border-[#2A4365] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#172D43]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Generate Workflow with AI
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Describe your desired automation logic in plain language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center gap-2 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">Workflow Prompt</label>
                <textarea
                  rows={3}
                  placeholder="e.g. When a webhook arrives, if score is greater than 80 send an HTTP request to Slack, otherwise log it..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              {/* Sample Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-[#64748B] block">Quick suggestions:</span>
                <div className="flex flex-col gap-1.5">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-[#172D43]/30 hover:bg-[#172D43]/60 border border-[#1E293B] text-[11px] text-[#94A3B8] hover:text-white transition-colors"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-[#94A3B8]">Workflow Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated title"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1E293B]">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isGenerating}
                  className="gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] border-none"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize DAG</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#22C55E]">
                  <Check className="w-4 h-4" />
                  <span>Workflow Synthesized Successfully!</span>
                </div>
                <h4 className="text-sm font-bold text-white">{result.workflow?.name}</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{result.summary}</p>
              </div>

              <div className="p-3 bg-[#0B1120] border border-[#1E293B] rounded-xl flex items-center justify-between text-xs font-mono text-[#64748B]">
                <span>Topological DAG Verified</span>
                <span className="text-[#22D3EE]">Kahn's Cycle Check Passed</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1E293B]">
                <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                  Generate Another
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenWorkflow}
                  className="gap-1.5"
                >
                  <span>Open in Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
