import { Workflow, Cpu, ShieldCheck, Zap, ArrowRight, Activity, Terminal } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#22D3EE]/15 to-[#8B5CF6]/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10 py-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#22D3EE]/20">
            <Workflow className="w-5 h-5 text-[#101827]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#F8FAFC] to-[#94A3B8] bg-clip-text text-transparent">
              NEXORA
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-mono uppercase tracking-widest text-[#22D3EE]/80 bg-[#172D43]/60 px-2 py-0.5 rounded-full border border-[#22D3EE]/20">
              v0.1.0-alpha
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </a>
          <div className="flex items-center gap-2 bg-[#172D43]/80 border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[#94A3B8]">Foundation Healthy</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center my-auto py-12 z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22D3EE]/30 bg-[#172D43]/50 text-xs font-mono text-[#22D3EE] mb-6">
          <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Connect. Orchestrate. Automate.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Automate Beyond <span className="bg-gradient-to-r from-[#22D3EE] via-[#67E8F9] to-[#8B5CF6] bg-clip-text text-transparent">Limits</span>.
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mb-8 leading-relaxed">
          Nexora is a visual workflow automation and orchestration SaaS designed for developers and technical teams.
          Build resilient, observable DAG workflows with zero-eval execution safety.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#101827] font-semibold text-sm px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-[#22D3EE]/25 transition-all hover:-translate-y-0.5"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="http://localhost:4000/api/v1/health"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#172D43] hover:bg-[#1E293B] text-white border border-[#334155] font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
          >
            <Activity className="w-4 h-4 text-[#22D3EE]" />
            <span>Health Endpoint</span>
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-5 rounded-xl bg-[#172D43]/40 border border-[#1E293B] hover:border-[#22D3EE]/30 transition-colors">
            <Cpu className="w-5 h-5 text-[#22D3EE] mb-3" />
            <h2 className="text-sm font-semibold text-white mb-1">Distributed DAG Engine</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Topological DAG validation, BullMQ async queueing, and isolated node execution contexts.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#172D43]/40 border border-[#1E293B] hover:border-[#22D3EE]/30 transition-colors">
            <ShieldCheck className="w-5 h-5 text-[#8B5CF6] mb-3" />
            <h2 className="text-sm font-semibold text-white mb-1">Zero-Trust Credential Vault</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              AES-256-GCM encrypted secrets at rest with per-workspace isolation and SSRF-guarded outbound calls.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#172D43]/40 border border-[#1E293B] hover:border-[#22D3EE]/30 transition-colors">
            <Activity className="w-5 h-5 text-[#22C55E] mb-3" />
            <h2 className="text-sm font-semibold text-white mb-1">Observable by Default</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Real-time WebSocket execution streams, per-node step durations, input/output inspection, and logs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl py-4 border-t border-[#1E293B] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] z-10">
        <span>© 2026 NEXORA. All rights reserved.</span>
        <span className="font-mono mt-2 sm:mt-0">Node.js {process.version || "v24"} • Next.js 15 • NestJS 10 • Prisma • Redis</span>
      </footer>
    </main>
  );
}
