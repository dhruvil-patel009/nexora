"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  PlayCircle,
  Puzzle,
  KeyRound,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Logo } from "../brand/Logo";

const navItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: Workflow,
    badge: null,
  },
  {
    name: "Executions",
    href: "/executions",
    icon: PlayCircle,
    badge: null,
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Puzzle,
    badge: null,
  },
  {
    name: "Credentials",
    href: "/credentials",
    icon: KeyRound,
    badge: null,
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Layers,
    badge: "Soon",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col border-r border-[#1E293B] bg-[#101827] transition-all duration-300 ease-in-out z-30 shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B]">
        <Link href="/dashboard" className="flex items-center overflow-hidden">
          <Logo size={32} showText={!collapsed} />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#22D3EE] hover:bg-[#172D43] transition-colors focus:outline-none"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Workspace Pill */}
      <div className="p-3 border-b border-[#1E293B]/60">
        <div
          className={`flex items-center rounded-lg bg-[#172D43]/50 border border-[#2A4365]/50 ${
            collapsed ? "justify-center p-2" : "px-3 py-2 justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-[#101827] font-bold text-xs shrink-0">
              D
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[#F8FAFC] truncate">Default Workspace</span>
                <span className="text-[10px] font-mono text-[#22D3EE]">Owner</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" title="Active" />
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg text-xs font-medium transition-all ${
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 justify-between"
              } ${
                isActive
                  ? "bg-[#172D43] text-[#22D3EE] font-semibold border-l-2 border-[#22D3EE] shadow-sm"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172D43]/40"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-[#22D3EE]" : "text-[#64748B] group-hover:text-[#F8FAFC]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B] border border-[#334155]/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & API Docs Link */}
      <div className="p-3 border-t border-[#1E293B] space-y-2">
        <a
          href="http://localhost:4000/docs"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center rounded-lg text-xs text-[#64748B] hover:text-[#22D3EE] hover:bg-[#172D43]/40 transition-colors ${
            collapsed ? "justify-center p-2" : "px-3 py-2 justify-between"
          }`}
          title="OpenAPI Documentation"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Shield className="w-4 h-4 shrink-0 text-[#22D3EE]/70" />
            {!collapsed && <span className="truncate">Swagger API Docs</span>}
          </div>
          {!collapsed && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
        </a>

        {!collapsed && (
          <div className="px-3 py-1 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
            <span>NEXORA Core</span>
            <span className="text-[#22C55E]">v0.1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
