"use client";

import React from "react";
import Link from "next/link";
import { Plus, Bell, Search, Terminal, Activity } from "lucide-react";
import { Button } from "../ui/Button";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <header className="h-16 px-6 border-b border-[#1E293B] bg-[#101827]/80 backdrop-blur-md flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Page Title & Breadcrumb context */}
      <div className="flex flex-col">
        {title && <h1 className="text-base font-semibold text-[#F8FAFC] tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* System Health Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-[#172D43]/60 border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#94A3B8]">Runtime Active</span>
        </div>

        {/* Global Primary Context Action */}
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button size="sm" variant="primary">
                <Plus className="w-3.5 h-3.5" />
                <span>{action.label}</span>
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" onClick={action.onClick}>
              <Plus className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
