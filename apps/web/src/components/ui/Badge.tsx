import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "cyan" | "violet" | "success" | "error" | "warning" | "muted";
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#1E293B] text-[#94A3B8] border-[#334155]",
    cyan: "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30",
    violet: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30",
    success: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
    error: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    warning: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    muted: "bg-[#172D43]/50 text-[#64748B] border-[#1E293B]",
  };

  const dotColors = {
    default: "bg-[#94A3B8]",
    cyan: "bg-[#22D3EE]",
    violet: "bg-[#8B5CF6]",
    success: "bg-[#22C55E]",
    error: "bg-[#EF4444]",
    warning: "bg-[#F59E0B]",
    muted: "bg-[#64748B]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
}
