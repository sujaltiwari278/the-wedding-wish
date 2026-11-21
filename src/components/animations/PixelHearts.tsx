"use client";

import React, { useEffect, useRef } from "react";

interface HeartParticle {
  x: number;
  y: number;
  size: number; // 1, 2, or 3 (multiplier of 2px pixel block)
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

const PALETTE_COLORS = [
  "#9C5968", // vintage
  "#D8A7A7", // rose-dusty
  "#EBCACA", // blush
  "#75404F", // deep
];

export function PixelHearts({
  className = "",
  maxHearts,
  count = 25,
}: {
  className?: string;
  maxHearts?: number;
  count?: number;
}) {
  const heartLimit = maxHearts ?? count;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check reduced motion preference
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const particles: HeartParticle[] = [];
    const spawnParticle = (): HeartParticle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 20,
      size: Math.random() > 0.6 ? 2 : 1, // 1x or 2x retro pixel heart
      speedY: 0.5 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: 0.3 + Math.random() * 0.7,
      color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
    });

    for (let i = 0; i < heartLimit; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height; // Distribute initially
      particles.push(p);
    }

    // Draw 8-bit retro pixel heart
    // Matrix of 7x6 pixels:
    // . X X . X X .
    // X X X X X X X
    // X X X X X X X
    // . X X X X X .
    // . . X X X . .
    // . . . X . . .
    const drawPixelHeart = (
      x: number,
      y: number,
      scale: number,
      color: string,
      opacity: number
    ) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      const p = scale * 2; // pixel block size (2px or 4px)

      // Row 0
      ctx.fillRect(x + 1 * p, y + 0 * p, 2 * p, p);
      ctx.fillRect(x + 4 * p, y + 0 * p, 2 * p, p);

      // Row 1
      ctx.fillRect(x + 0 * p, y + 1 * p, 7 * p, p);

      // Row 2
      ctx.fillRect(x + 0 * p, y + 2 * p, 7 * p, p);

      // Row 3
      ctx.fillRect(x + 1 * p, y + 3 * p, 5 * p, p);

      // Row 4
      ctx.fillRect(x + 2 * p, y + 4 * p, 3 * p, p);

      // Row 5
      ctx.fillRect(x + 3 * p, y + 5 * p, 1 * p, p);
    };

    const render = () => {
      if (isTabVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
          p.y -= p.speedY;
          p.x += p.speedX;

          if (p.y < -30) {
            particles[index] = spawnParticle();
          }

          drawPixelHeart(p.x, p.y, p.size, p.color, p.opacity);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [heartLimit]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
