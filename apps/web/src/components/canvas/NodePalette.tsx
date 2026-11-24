import React from "react";
import { Play, Webhook, Globe, GitFork, Clock, Terminal } from "lucide-react";
import { NodeType } from "@nexora/shared";

interface NodePaletteProps {
  onAddNode: (type: NodeType, label: string) => void;
}

const availablePaletteNodes: Array<{
  type: NodeType;
  label: string;
  description: string;
  icon: any;
  category: "Triggers" | "Actions" | "Logic";
}> = [
  {
    type: "manual-trigger",
    label: "Manual Trigger",
    description: "Start runs with custom input",
    icon: Play,
    category: "Triggers",
  },
  {
    type: "webhook-trigger",
    label: "Webhook Trigger",
    description: "Receive inbound HTTP payload",
    icon: Webhook,
    category: "Triggers",
  },
  {
    type: "http-request",
    label: "HTTP Request",
    description: "GET, POST, PUT, DELETE APIs",
    icon: Globe,
    category: "Actions",
  },
  {
    type: "logger",
    label: "Logger",
    description: "Record node output snapshot",
    icon: Terminal,
    category: "Actions",
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch if/else on expressions",
    icon: GitFork,
    category: "Logic",
  },
  {
    type: "delay",
    label: "Delay",
    description: "Queue-backed async pause",
    icon: Clock,
    category: "Logic",
  },
];

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-64 bg-[#101827]/95 border-r border-[#1E293B] p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none backdrop-blur-md">
      <div>
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
          Node Library
        </h2>
        <p className="text-[11px] text-[#64748B] mt-0.5">Click to insert into canvas</p>
      </div>

      <div className="space-y-4">
        {(["Triggers", "Actions", "Logic"] as const).map((category) => {
          const items = availablePaletteNodes.filter((n) => n.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#22D3EE] uppercase tracking-wider font-semibold">
                {category}
              </span>
              <div className="space-y-1.5">
                {items.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => onAddNode(node.type, node.label)}
                      className="w-full text-left p-2.5 rounded-lg bg-[#172D43]/60 hover:bg-[#172D43] border border-[#2A4365] hover:border-[#22D3EE]/60 transition-all flex items-center gap-3 group active:scale-[0.98]"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#101827] border border-[#2A4365] flex items-center justify-center text-[#22D3EE] group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-semibold text-white block leading-tight truncate">
                          {node.label}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] block truncate">
                          {node.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
