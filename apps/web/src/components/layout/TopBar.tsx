"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import { Button } from "../ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { AuthUser } from "@nexora/shared";

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
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

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

        {/* User Profile Pill or Login link */}
        {user ? (
          <div className="flex items-center gap-2 bg-[#172D43]/50 border border-[#2A4365] px-2.5 py-1 rounded-lg text-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-[#101827] font-bold text-[10px]">
              {user.fullName[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-medium text-white">{user.fullName}</span>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
          >
            Sign In
          </Link>
        )}

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

