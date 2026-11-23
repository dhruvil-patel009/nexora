import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Geometric Connected-Node SVG Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="nexoraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagonal Shield / Boundary */}
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="10"
          fill="#172D43"
          stroke="#22D3EE"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Connecting Edges */}
        <path
          d="M12 20H20M20 20H28M20 12V20M20 20V28"
          stroke="url(#nexoraGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Diagonal Pulse Connections */}
        <path
          d="M14 14L20 20L26 26M26 14L20 20L14 26"
          stroke="#22D3EE"
          strokeWidth="1.2"
          strokeOpacity="0.3"
          strokeDasharray="2 2"
        />

        {/* Central Orchestration Core Node */}
        <circle
          cx="20"
          cy="20"
          r="4.5"
          fill="url(#nexoraGrad)"
          filter="url(#glow)"
        />
        <circle cx="20" cy="20" r="2" fill="#101827" />

        {/* Connected Trigger & Action Satellite Nodes */}
        <circle cx="12" cy="20" r="2.5" fill="#22D3EE" />
        <circle cx="28" cy="20" r="2.5" fill="#8B5CF6" />
        <circle cx="20" cy="12" r="2.5" fill="#22D3EE" />
        <circle cx="20" cy="28" r="2.5" fill="#8B5CF6" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#F8FAFC] via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent leading-none">
            NEXORA
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#22D3EE] uppercase mt-0.5 leading-none">
            Automate Beyond Limits
          </span>
        </div>
      )}
    </div>
  );
}
