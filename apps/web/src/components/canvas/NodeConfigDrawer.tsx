import React from "react";
import { X, Trash2, Settings2 } from "lucide-react";
import { Button } from "../ui/Button";

interface NodeConfigDrawerProps {
  node: any | null;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, updatedData: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function NodeConfigDrawer({
  node,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}: NodeConfigDrawerProps) {
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

  return (
    <div className="w-80 bg-[#101827]/95 border-l border-[#1E293B] p-5 flex flex-col justify-between overflow-y-auto shrink-0 backdrop-blur-md z-30 shadow-2xl">
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
            </div>

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
              Expression Rule
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
                <option value="greater_than">greater than (&gt;)</option>
                <option value="less_than">less than (&lt;)</option>
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

        {node.type === "delay" && (
          <div className="space-y-3 pt-3 border-t border-[#1E293B]">
            <h4 className="text-xs font-mono font-semibold text-[#F59E0B] uppercase tracking-wider">
              Delay Duration
            </h4>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Seconds to Wait</label>
              <input
                type="number"
                min="1"
                max="300"
                value={config.durationSeconds || 5}
                onChange={(e) => handleConfigChange("durationSeconds", Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
          </div>
        )}

        {node.type === "logger" && (
          <div className="space-y-3 pt-3 border-t border-[#1E293B]">
            <h4 className="text-xs font-mono font-semibold text-[#22C55E] uppercase tracking-wider">
              Logger Configuration
            </h4>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">Log Message / Expression</label>
              <input
                type="text"
                value={config.message || "Execution completed successfully"}
                onChange={(e) => handleConfigChange("message", e.target.value)}
                className="w-full px-3 py-1.5 bg-[#172D43] border border-[#2A4365] rounded-lg text-xs text-white focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
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
