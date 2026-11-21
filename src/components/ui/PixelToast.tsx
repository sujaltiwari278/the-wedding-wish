"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PixelToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function PixelToast({
  message,
  type = "info",
  duration = 4000,
  onClose,
  className,
}: PixelToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: "bg-[#E2F0D9] border-[#548235] text-[#385723]",
    error: "bg-[#FCE4D6] border-[#C00000] text-[#C00000]",
    info: "bg-soft-blush border-deep text-deep",
  };

  const icons = {
    success: "★",
    error: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-3 border-3 px-4 py-3 shadow-pixel font-retro text-lg",
        typeStyles[type],
        className
      )}
      role="alert"
    >
      <span className="font-pixel text-xs">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="font-pixel text-[10px] ml-2 opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
