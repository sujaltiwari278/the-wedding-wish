"use client";

import React, { useState } from "react";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";

interface CelebrationBannerProps {
  completedGoalTitles: string[];
}

export function CelebrationBanner({
  completedGoalTitles,
}: CelebrationBannerProps) {
  const [isVisible, setIsVisible] = useState(completedGoalTitles.length > 0);

  if (!isVisible || completedGoalTitles.length === 0) return null;

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await fetch("/api/couple/celebration", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PixelCard
      variant="blush"
      shadow="lg"
      className="border-4 border-vintage relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="text-4xl animate-bounce">🎉</div>
          <div>
            <div className="font-pixel text-[10px] text-vintage uppercase tracking-wider block">
              ★ SHAGUN MILESTONE ACHIEVED!
            </div>
            <h2 className="font-pixel text-base text-deep">
              {completedGoalTitles.join(" & ")} IS FULLY FUNDED!
            </h2>
            <p className="font-retro text-lg text-deep/80">
              Your loved ones have completely fulfilled this wedding dream! Time
              to celebrate and send warm blessings in return.
            </p>
          </div>
        </div>

        <PixelButton size="sm" variant="primary" onClick={handleDismiss}>
          CELEBRATE & DISMISS ✦
        </PixelButton>
      </div>
    </PixelCard>
  );
}
