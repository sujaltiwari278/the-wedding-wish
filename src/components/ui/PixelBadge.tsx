import React from "react";
import { cn } from "@/lib/utils";

export interface PixelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "completed" | "archived" | "neutral" | "shagun" | "pending";
  size?: "sm" | "md";
}

export function PixelBadge({
  children,
  className,
  variant = "neutral",
  size = "md",
  ...props
}: PixelBadgeProps) {
  const variantStyles = {
    active: "bg-[#7AA874] text-cream border-deep",
    completed: "bg-vintage text-cream border-deep",
    archived: "bg-blush text-deep border-deep opacity-75",
    neutral: "bg-soft-blush text-deep border-deep",
    shagun: "bg-rose-dusty text-deep border-deep",
    pending: "bg-[#FBBF24] text-deep border-deep",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-3 py-1 text-[11px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-pixel uppercase tracking-wide border-2 shadow-pixel-sm select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span className="inline-block text-[8px]">●</span>
      {children}
    </span>
  );
}
