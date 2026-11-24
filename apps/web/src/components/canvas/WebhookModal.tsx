"use client";

import React, { useState } from "react";
import { X, Copy, Check, Webhook, Terminal, Shield, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  workflowName: string;
  publishedAt?: string;
}

export function WebhookModal({
  isOpen,
  onClose,
  webhookUrl,
  workflowName,
  publishedAt,
}: WebhookModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const curlCommand = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "lead_created", "email": "dev@nexora.dev", "score": 98}'`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101827] border border-[#2A4365] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#172D43]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Inbound Webhook Endpoint
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#059669]/20 text-[#34D399] border border-[#059669]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Workflow: <span className="text-white font-medium">{workflowName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Webhook URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Public Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-[#0B1120] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#22D3EE] focus:outline-none select-all"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyUrl}
                className="gap-1.5 shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-[#22C55E]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* cURL Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Test with cURL</span>
              </div>
              <button
                onClick={handleCopyCurl}
                className="text-xs font-mono text-[#22D3EE] hover:underline flex items-center gap-1"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-[#22C55E]" />
                    <span className="text-[#22C55E]">Command Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-[11px] font-mono text-[#94A3B8] overflow-x-auto leading-relaxed select-all">
              {curlCommand}
            </pre>
          </div>

          {/* Security & Context Info */}
          <div className="bg-[#172D43]/40 border border-[#2A4365] rounded-xl p-3.5 flex items-start gap-3">
            <Shield className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block">
                Cryptographic Token Security
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                This endpoint is gated by a 32-byte cryptographically secure random token hashed with SHA-256. Inbound payloads are capped at 1MB with automatic rate limiting (120 req/min). Payloads are exposed to downstream nodes as <code className="text-[#22D3EE] font-mono text-[10px]">{"{{trigger.email}}"}</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#172D43]/20 flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#64748B]">
            {publishedAt ? `Published ${new Date(publishedAt).toLocaleString()}` : "Ready to receive events"}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
