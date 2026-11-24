"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Nexora Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#101827] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mb-6 text-[#EF4444] shadow-lg">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">An Unexpected Error Occurred</h1>
      <p className="text-xs font-mono text-[#94A3B8] max-w-lg mb-6 bg-[#172D43]/60 p-3 rounded-lg border border-[#1E293B] break-words">
        {error.message || "Something went wrong while rendering this interface."}
      </p>

      <Button onClick={reset} variant="primary" size="md">
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
