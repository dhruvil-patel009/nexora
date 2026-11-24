import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#101827] font-semibold hover:shadow-lg hover:shadow-[#22D3EE]/25 hover:brightness-105 border border-[#22D3EE]/30",
      secondary:
        "bg-[#172D43] text-[#F8FAFC] hover:bg-[#1E3A57] border border-[#2A4365] hover:border-[#22D3EE]/40",
      outline:
        "bg-transparent text-[#F8FAFC] border border-[#2A4365] hover:border-[#22D3EE] hover:bg-[#172D43]/40 hover:text-[#22D3EE]",
      ghost:
        "bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172D43]/50",
      danger:
        "bg-[#EF4444] text-white hover:bg-[#DC2626] border border-[#F87171]/40 hover:shadow-lg hover:shadow-[#EF4444]/20",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "w-9 h-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
