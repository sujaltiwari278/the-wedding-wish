"use client";

import React, { useEffect, useState } from "react";
import { Sprite } from "./Sprite";
import { PixelHearts } from "./PixelHearts";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { sound } from "@/lib/sound";
import { formatIndianRupees } from "@/lib/money";

interface GoalCelebrationOverlayProps {
  goalTitle: string;
  collectedAmountPaise: number;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalCelebrationOverlay({
  goalTitle,
  collectedAmountPaise,
  isOpen,
  onClose,
}: GoalCelebrationOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Play celebratory fanfare on open
      try {
        sound.playCelebrationFanfare();
      } catch {
        // user interaction might be pending
      }
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep/80 backdrop-blur-none transition-opacity duration-200 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Floating pixel hearts layer */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <PixelHearts count={24} />
        </div>
      )}

      <PixelCard
        variant="elevated"
        className="relative z-10 max-w-lg w-full bg-cream text-center border-4 border-deep shadow-pixel-lg p-6 md:p-8 space-y-6"
      >
        {/* Retro Header Banner */}
        <div className="inline-block bg-vintage text-cream font-pixel text-xs md:text-sm px-4 py-2 border-2 border-deep uppercase animate-pulse">
          ✨ DIL SE SHAGUN! GOAL ACHIEVED! ✨
        </div>

        {/* Animated Couple Sprite */}
        <div className="flex justify-center items-center py-2">
          <Sprite
            src="/sprites/couple-celebrate.svg"
            frameWidth={48}
            frameHeight={48}
            frameCount={4}
            fps={6}
            scale={2.5}
            alt="Celebrating Bride and Groom"
          />
        </div>

        {/* Goal Description & Achievement */}
        <div className="space-y-2">
          <h2 className="font-pixel text-xl md:text-2xl text-deep leading-tight">
            {goalTitle}
          </h2>
          <p className="font-retro text-2xl text-vintage">
            100% Funded with {formatIndianRupees(collectedAmountPaise)} in Shagun!
          </p>
          <p className="font-retro text-lg text-vintage/90 max-w-md mx-auto">
            Your loved ones have come together to turn this dream into a beautiful reality.
            May your journey ahead be blessed with joy!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <PixelButton
            variant="primary"
            size="lg"
            onClick={() => {
              sound.playClickBeep();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Celebrate & Continue
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
}
