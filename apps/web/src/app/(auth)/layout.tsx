import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#101827] relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#22D3EE]/15 to-[#8B5CF6]/15 blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <Link href="/" className="flex items-center">
          <Logo size={36} />
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#22C55E] bg-[#172D43]/60 px-2.5 py-1 rounded-md border border-[#22C55E]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Trust Auth</span>
        </div>
      </header>

      {/* Auth Card Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        {children}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-xs text-[#64748B] z-10 font-mono">
        <span>NEXORA • Automate Beyond Limits</span>
      </footer>
    </div>
  );
}
