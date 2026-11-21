"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sound } from "@/lib/sound";

export interface PixelBackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function PixelBackButton({
  href,
  label = "BACK",
  className = "",
  onClick,
}: PixelBackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    try {
      sound.playClickBeep();
    } catch {
      // Sound failure should not prevent navigation
    }

    if (onClick) {
      onClick();
    }

    if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  // Clean label of any existing arrows so we render a consistent retro pixel triangle
  const cleanLabel = label.replace(/^[←◀]\s*/, "");

  const baseStyles = `
    inline-flex items-center gap-2 px-3 py-1.5
    bg-cream hover:bg-blush text-deep font-pixel text-[10px] sm:text-xs
    border-2 border-deep shadow-pixel-sm hover:shadow-pixel
    transition-all active:translate-x-0.5 active:translate-y-0.5
    cursor-pointer select-none min-h-[36px] sm:min-h-[40px]
    focus:outline-none focus-visible:ring-2 focus-visible:ring-deep
    ${className}
  `.trim();

  if (href) {
    return (
      <Link href={href} onClick={handleClick} className={baseStyles}>
        <span className="text-vintage font-bold select-none">◀</span>
        <span className="tracking-wider uppercase">{cleanLabel}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={baseStyles}>
      <span className="text-vintage font-bold select-none">◀</span>
      <span className="tracking-wider uppercase">{cleanLabel}</span>
    </button>
  );
}
