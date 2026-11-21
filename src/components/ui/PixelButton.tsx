"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-pixel uppercase tracking-wider text-xs border-pixel-sm select-none transition-all duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#75404F] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-deep disabled:opacity-50 disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none";

    const variantStyles = {
      primary:
        "bg-vintage text-cream border-deep shadow-pixel hover:bg-[#8B4C5A]",
      secondary:
        "bg-blush text-deep border-deep shadow-pixel hover:bg-rose-dusty",
      ghost:
        "bg-transparent text-deep border-deep shadow-pixel-sm hover:bg-soft-blush",
      danger:
        "bg-[#B44C43] text-cream border-deep shadow-pixel hover:bg-[#9E3E37]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-[10px] min-h-[36px] sm:min-h-[44px] shadow-pixel-sm",
      md: "px-4 sm:px-5 py-2 sm:py-2.5 text-xs min-h-[44px] shadow-pixel",
      lg: "px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm min-h-[48px] shadow-pixel-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block animate-pulse">◆</span>
            <span>WAIT...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";
