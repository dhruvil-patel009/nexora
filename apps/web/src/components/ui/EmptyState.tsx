import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#2A4365] bg-[#172D43]/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#172D43] border border-[#2A4365] flex items-center justify-center mb-4 text-[#22D3EE] shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#101827] font-semibold text-xs px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#22D3EE]/25 transition-all"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#101827] font-semibold text-xs px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#22D3EE]/25 transition-all"
            >
              {actionLabel}
            </button>
          )
        )}

        {secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 bg-[#172D43] hover:bg-[#1E3A57] text-[#F8FAFC] border border-[#2A4365] text-xs px-4 py-2 rounded-lg transition-all"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
