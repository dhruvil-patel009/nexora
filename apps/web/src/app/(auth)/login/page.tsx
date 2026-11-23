"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      setAuthSession(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#172D43]/85 border-[#2A4365] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Sign in to access your workspaces and orchestration graphs
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-[#EF4444] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@nexora.dev"
              className="w-full pl-9 pr-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono text-[#94A3B8]">Password</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE] transition-colors"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          <span>Sign In to Nexora</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#22D3EE] hover:underline font-medium">
          Create one now
        </Link>
      </div>
    </Card>
  );
}
