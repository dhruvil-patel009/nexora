import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Layers, Sparkles, Clock } from "lucide-react";

const plannedCategories = [
  {
    title: "Inbound Webhook Ingestion",
    description: "Validate incoming webhook payloads, branch based on conditions, and log output.",
  },
  {
    title: "Incident & Error Alerting",
    description: "Poll APIs or receive error events and dispatch structured Slack alerts.",
  },
  {
    title: "API Data Sync Pipeline",
    description: "Fetch records from an external endpoint, transform schemas, and POST downstream.",
  },
];

export default function TemplatesPage() {
  return (
    <>
      <TopBar
        title="Workflow Templates"
        subtitle="Pre-configured DAG workflows to accelerate your automation architecture."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="p-8 rounded-2xl bg-[#172D43]/30 border border-[#2A4365] text-center max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <Badge variant="violet" className="mb-3">
            Coming Soon (Post-MVP)
          </Badge>
          <h2 className="text-xl font-bold text-white mb-2">Workflow Template Gallery</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-6">
            Pre-built workflow blueprints are scheduled for post-MVP delivery after the core execution engine and visual canvas are fully hardened.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {plannedCategories.map((cat) => (
              <div key={cat.title} className="p-3.5 rounded-lg bg-[#101827] border border-[#1E293B]">
                <h3 className="text-xs font-semibold text-white mb-1">{cat.title}</h3>
                <p className="text-[11px] text-[#64748B] leading-normal">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
