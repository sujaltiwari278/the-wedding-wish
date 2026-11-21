import React from "react";
import { cn } from "@/lib/utils";

export interface PixelProgressBarProps {
  progress: number; // 0 to 100
  segments?: number; // default 10
  showLabel?: boolean;
  className?: string;
  variant?: "vintage" | "dusty" | "deep";
  size?: "sm" | "md" | "lg";
}

export function PixelProgressBar({
  progress,
  segments = 10,
  showLabel = true,
  className,
  variant = "vintage",
  size = "md",
}: PixelProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const filledSegments = Math.round((clampedProgress / 100) * segments);

  const fillColors = {
    vintage: "bg-vintage",
    dusty: "bg-rose-dusty",
    deep: "bg-deep",
  };

  const heights = {
    sm: "h-4",
    md: "h-6",
    lg: "h-8",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between font-pixel text-[11px] text-deep">
        <span className="tracking-wider">GOAL PROGRESS</span>
        {showLabel && (
          <span className="font-bold text-vintage">{clampedProgress}%</span>
        )}
      </div>

      {/* Segmented Bar Frame */}
      <div
        className={cn(
          "w-full bg-cream border-2 border-deep p-1 flex gap-1 shadow-pixel-sm",
          heights[size]
        )}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const isFilled = index < filledSegments;
          return (
            <div
              key={index}
              className={cn(
                "flex-1 transition-colors duration-150 border border-deep/20",
                isFilled ? fillColors[variant] : "bg-soft-blush/40"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
