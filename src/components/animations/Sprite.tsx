"use client";

import React, { useState, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

export interface SpriteProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  scale?: number;
  paused?: boolean;
  className?: string;
  alt?: string;
  onAnimationEnd?: () => void;
}

export function Sprite({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 8,
  loop = true,
  scale = 1,
  paused = false,
  className,
  alt = "Pixel Sprite Animation",
  onAnimationEnd,
}: SpriteProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rawId = useId();
  const animName = `sprite_anim_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const totalWidth = frameWidth * frameCount;
  const durationSeconds = frameCount / fps;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("inline-block relative overflow-hidden select-none", className)}
      style={{
        width: `${frameWidth * scale}px`,
        height: `${frameHeight * scale}px`,
      }}
    >
      <style>{`
        @keyframes ${animName} {
          from { transform: translateX(0px); }
          to { transform: translateX(-${totalWidth * scale}px); }
        }
      `}</style>

      <div
        onAnimationEnd={onAnimationEnd}
        style={{
          width: `${totalWidth * scale}px`,
          height: `${frameHeight * scale}px`,
          backgroundImage: `url(${src})`,
          backgroundSize: `${totalWidth * scale}px ${frameHeight * scale}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          animation:
            prefersReducedMotion || paused
              ? "none"
              : `${animName} ${durationSeconds}s steps(${frameCount}) ${
                  loop ? "infinite" : "forwards"
                }`,
        }}
      />
    </div>
  );
}
