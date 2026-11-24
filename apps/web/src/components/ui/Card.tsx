import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  className = "",
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-[#172D43]/70 backdrop-blur-sm border border-[#1E293B] rounded-xl p-5 ${
        hoverEffect ? "hover:border-[#22D3EE]/40 hover:shadow-lg hover:shadow-[#22D3EE]/5 transition-all duration-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between pb-3 border-b border-[#1E293B] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-[#F8FAFC] tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-[#94A3B8] mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
