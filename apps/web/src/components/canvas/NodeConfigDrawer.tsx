import React, { useState } from "react";
import { X, Trash2, Settings2, Play, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";

interface NodeConfigDrawerProps {
  node: any | null;
  workflowId?: string;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, updatedData: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function NodeConfigDrawer({
  node,
  workflowId,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}: NodeConfigDrawerProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  if (!node) return null;

  const data = node.data || {};
  const config = data.config || {};

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateConfig(node.id, {
      ...data,
      label: e.target.value,
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    onUpdateConfig(node.id, {
      ...data,
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleTestNode = async () => {
    if (!workflowId) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/workflows/${workflowId}/test-node`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          nodeType: node.type,
          config,
          sampleContext: {
            trigger: { testId: "test_123", timestamp: Date.now() },
            steps: {},
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || "Test request failed" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-88 bg-[#101827]/95 border-l border-[#1E293B] p-5 flex flex-col justify-between overflow-y-auto shrink-0 backdrop-blur-md z-30 shadow-2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="text-sm font-semibold text-white">Node Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#172D43] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Type & Name */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Node Label</label>
            <input
              type="text"
              value={data.label || ""}
              onChange={handleLabelChange}
              className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Node Type</label>
            <div className="px-3 py-1.5 bg-[#172D43]/50 border border-[#1E293B] rounded-lg text-xs font-mono text-[#22D3EE]">
              {node.type}
            </div>
          </div>
        </div>

        {/* Specific Node Configurations */}
        {node.type === "http-request" && (
          <div className="space-y-3 pt-3 border-t border-[#1E293B]">
            <h4 className="text-xs font-mono font-semibold text-[#22D3EE] uppercase tracking-wider">
              HTTP Request Setup
            </h4>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Method</label>
              <select
                value={config.method || "GET"}
                onChange={(e) => handleConfigChange("method", e.target.value)}
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Target URL</label>
              <input
                type="text"
                value={config.url || ""}
                onChange={(e) => handleConfigChange("url", e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
              <span className="text-[10px] text-[#64748B] block mt-0.5">
                Protected against SSRF. Supports variable tags: &#123;&#123;steps.node.data&#125;&#125;
              </span>
            </div>

            {["POST", "PUT", "PATCH"].includes((config.method || "GET").toUpperCase()) && (
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Request Body (JSON)</label>
                <textarea
                  value={typeof config.body === "string" ? config.body : JSON.stringify(config.body || {}, null, 2)}
                  onChange={(e) => handleConfigChange("body", e.target.value)}
                  rows={4}
                  placeholder='{ "key": "value" }'
                  className="w-full p-2.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs font-mono text-[#22D3EE] focus:outline-none focus:border-[#22D3EE] resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Timeout (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.timeoutSeconds || 10}
                onChange={(e) => handleConfigChange("timeoutSeconds", Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>
        )}

        {node.type === "condition" && (
          <div className="space-y-3 pt-3 border-t border-[#1E293B]">
            <h4 className="text-xs font-mono font-semibold text-[#8B5CF6] uppercase tracking-wider">
              Expression Rule (Zero-Eval)
            </h4>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Target Field Path</label>
              <input
                type="text"
                value={config.variable || "payload.status"}
                onChange={(e) => handleConfigChange("variable", e.target.value)}
                placeholder="payload.status"
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Operator</label>
              <select
                value={config.operator || "equals"}
                onChange={(e) => handleConfigChange("operator", e.target.value)}
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="equals">equals (==)</option>
                <option value="not_equals">not equals (!=)</option>
                <option value="contains">contains</option>
                <option value="not_contains">does not contain</option>
                <option value="greater_than">greater than (&gt;)</option>
                <option value="less_than">less than (&lt;)</option>
                <option value="greater_than_or_equal">greater than or equal (&gt;=)</option>
                <option value="less_than_or_equal">less than or equal (&lt;=)</option>
                <option value="is_empty">is empty</option>
                <option value="is_not_empty">is not empty</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Compare Value</label>
              <input
                type="text"
                value={config.value || "200"}
                onChange={(e) => handleConfigChange("value", e.target.value)}
                placeholder="e.g. 200 or active"
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>
        )}

        {/* Isolated Test Node Trigger */}
        {workflowId && ["http-request", "condition", "logger"].includes(node.type) && (
          <div className="pt-3 border-t border-[#1E293B] space-y-2">
            <button
              onClick={handleTestNode}
              disabled={isTesting}
              className="w-full py-1.5 px-3 rounded-lg bg-[#172D43] hover:bg-[#1E3A57] border border-[#2A4365] hover:border-[#22D3EE] text-xs font-semibold text-[#22D3EE] flex items-center justify-center gap-2 transition-all"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Test This Node</span>
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] font-mono space-y-1 ${
                  testResult.success
                    ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                    : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    {testResult.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {testResult.success ? "Success" : "Failed"}
                  </span>
                  <span className="text-[#94A3B8]">{testResult.durationMs}ms</span>
                </div>
                {testResult.error && <div>{testResult.error}</div>}
                {testResult.output && (
                  <pre className="p-1.5 rounded bg-[#101827] text-[#22D3EE] overflow-x-auto max-h-24">
                    {JSON.stringify(testResult.output, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Action */}
      <div className="pt-4 border-t border-[#1E293B]">
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDeleteNode(node.id)}
          className="w-full gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node</span>
        </Button>
      </div>
    </div>
  );
}
