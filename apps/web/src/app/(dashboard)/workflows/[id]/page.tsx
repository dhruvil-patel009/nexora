"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { WorkflowGraphDefinition } from "@nexora/shared";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflow() {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const workspace = getActiveWorkspace();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

        const res = await fetch(`${apiUrl}/workflows/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-workspace-id": workspace?.id || "",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load workflow (${res.status})`);
        }

        const data = await res.json();
        setWorkflow(data);
      } catch (err: any) {
        setError(err.message || "Failed to load workflow definition");
      } finally {
        setIsLoading(false);
      }
    }

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const handleSave = async (definition: WorkflowGraphDefinition) => {
    setIsSaving(true);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      const res = await fetch(`${apiUrl}/workflows/${workflowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({ definition }),
      });

      if (!res.ok) {
        throw new Error("Failed to save workflow definition");
      }

      const updated = await res.json();
      setWorkflow(updated);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#101827] text-center p-6">
        <Loader2 className="w-8 h-8 text-[#22D3EE] animate-spin mb-3" />
        <span className="text-xs font-mono text-[#94A3B8]">Loading workflow canvas...</span>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#101827] text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-white mb-1">Workflow Not Found</h2>
        <p className="text-xs text-[#94A3B8] max-w-sm mb-6">{error || "Could not retrieve workflow graph."}</p>
        <Link href="/workflows">
          <Button variant="secondary" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workflows</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <WorkflowCanvas
        workflowId={workflow.id}
        workflowName={workflow.name}
        workflowStatus={workflow.status}
        initialDefinition={workflow.definition}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
