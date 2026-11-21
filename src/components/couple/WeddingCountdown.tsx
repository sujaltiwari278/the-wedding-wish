"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WeddingCountdownProps {
  weddingDate: string | Date;
  className?: string;
  variant?: "banner" | "compact";
}

export function WeddingCountdown({
  weddingDate,
  className,
  variant = "banner",
}: WeddingCountdownProps) {
  const target = new Date(weddingDate);
  const now = new Date();

  // Reset hours to compare calendar days
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusText = "";
  let numberDisplay = "";

  if (diffDays > 1) {
    numberDisplay = `${diffDays}`;
    statusText = "DAYS TO GO";
  } else if (diffDays === 1) {
    numberDisplay = "1";
    statusText = "DAY TO GO";
  } else if (diffDays === 0) {
    numberDisplay = "★";
    statusText = "TODAY IS THE BIG DAY!";
  } else {
    const passedDays = Math.abs(diffDays);
    numberDisplay = `${passedDays}`;
    statusText = passedDays === 1 ? "DAY AS NEWLYWEDS" : "DAYS AS NEWLYWEDS";
  }

  const formattedDate = target.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 bg-cream border-2 border-deep px-3 py-1 shadow-pixel-sm",
          className
        )}
      >
        <span className="text-sm">⏳</span>
        <span className="font-pixel text-[11px] text-vintage font-bold">
          {numberDisplay} {statusText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-soft-blush border-3 border-deep p-4 md:p-6 shadow-pixel text-center relative overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="font-pixel text-[10px] uppercase text-vintage tracking-widest">
          WEDDING DATE: {formattedDate}
        </div>

        <div className="flex items-baseline justify-center gap-2">
          {diffDays !== 0 && (
            <span className="font-pixel text-3xl md:text-5xl text-deep font-bold">
              {numberDisplay}
            </span>
          )}
          <span className="font-pixel text-base md:text-xl text-vintage uppercase">
            {statusText}
          </span>
        </div>

        <p className="font-retro text-lg text-deep/70">
          Every shagun contribution brings this couple closer to their dreams!
        </p>
      </div>
    </div>
  );
}
