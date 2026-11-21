"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PixelModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: PixelModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Pixelated backdrop */}
      <div
        className="fixed inset-0 bg-deep/60 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-10 w-[calc(100vw-1rem)] sm:w-full max-w-lg bg-soft-blush border-4 border-deep shadow-pixel-lg p-4 sm:p-6 max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-deep/20 pb-3 mb-4">
          <h2 className="font-pixel text-sm text-deep uppercase tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="font-pixel text-xs bg-cream border-2 border-deep px-2 py-1 shadow-pixel-sm hover:bg-blush active:translate-x-[1px] active:translate-y-[1px] text-deep"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
