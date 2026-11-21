import React from "react";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";

interface PublicWish {
  id: string;
  firstName: string;
  message: string;
  createdAt: string | Date;
}

interface PublicWishesStripProps {
  wishes: PublicWish[];
}

export function PublicWishesStrip({ wishes }: PublicWishesStripProps) {
  if (wishes.length === 0) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 border-b-2 border-deep/20 pb-2">
        <span className="text-xl">💌</span>
        <h3 className="font-pixel text-xs text-deep uppercase tracking-wider">
          RECENT BLESSINGS & WISHES FROM GUESTS
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishes.map((w) => (
          <PixelCard key={w.id} variant="cream" shadow="sm" className="space-y-2">
            <div className="flex justify-between items-center border-b border-deep/15 pb-1">
              <span className="font-pixel text-[11px] text-vintage">
                {w.firstName}
              </span>
              <span className="font-retro text-xs text-deep/60">
                {new Date(w.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <p className="font-retro text-lg text-deep italic leading-snug">
              &ldquo;{w.message}&rdquo;
            </p>
          </PixelCard>
        ))}
      </div>
    </div>
  );
}
