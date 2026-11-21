import React from "react";
import { cn } from "@/lib/utils";

export interface PixelEmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PixelEmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: PixelEmptyStateProps) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-deep/40 bg-soft-blush/50 p-8 text-center flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      {illustration ? (
        <div className="text-4xl text-deep mb-2">{illustration}</div>
      ) : (
        <div className="w-16 h-16 border-2 border-deep bg-cream flex items-center justify-center text-2xl font-pixel text-vintage shadow-pixel-sm">
          ✉
        </div>
      )}

      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-pixel text-xs text-deep uppercase tracking-wider">
          {title}
        </h3>
        {description && (
          <p className="font-retro text-lg text-deep/75">{description}</p>
        )}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
