import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#172D43]/60 border border-[#1E293B] ${className}`}
      {...props}
    />
  );
}
