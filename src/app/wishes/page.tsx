"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatIndianRupees } from "@/lib/money";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelEmptyState } from "@/components/ui/PixelEmptyState";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

interface WishItem {
  id: string;
  message: string;
  starred: boolean;
  createdAt: string;
  guestName: string;
  guestRelationship?: string;
  goalTitle: string;
  amount: number;
}

export default function CoupleWishesPage() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch("/api/wishes");
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const toggleStar = async (id: string) => {
    // Optimistic UI update
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w))
    );

    try {
      await fetch(`/api/wishes/${id}/star`, { method: "PATCH" });
    } catch (err) {
      console.error(err);
      fetchWishes();
    }
  };

  const filtered = wishes.filter((w) => {
    if (activeTab === "starred") return w.starred;
    return true;
  });

  const starredCount = wishes.filter((w) => w.starred).length;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/dashboard" label="← DASHBOARD" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
              BLESSINGS WALL
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel text-deep">
              GUEST BLESSINGS & WISHES
            </h1>
            <p className="font-retro text-2xl text-deep/80">
              Preserving every heartfelt message left with shagun envelopes.
            </p>
          </div>

          <PixelTabs
            tabs={[
              { id: "all", label: "All Wishes", count: wishes.length },
              { id: "starred", label: "★ Starred", count: starredCount },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {isLoading ? (
          <div className="py-20 text-center font-pixel text-xs text-vintage animate-pulse">
            LOADING GUEST BLESSINGS...
          </div>
        ) : filtered.length === 0 ? (
          <PixelEmptyState
            title={
              activeTab === "starred"
                ? "No Starred Wishes Yet"
                : "No Guest Wishes Received Yet"
            }
            description={
              activeTab === "starred"
                ? "Click the star icon on any blessing to highlight it in this view."
                : "As guests contribute shagun to your wedding dreams, their blessings will appear here."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((w) => (
              <PixelCard
                key={w.id}
                variant={w.starred ? "blush" : "cream"}
                shadow="sm"
                className="space-y-3"
              >
                <div className="flex justify-between items-start border-b border-deep/20 pb-2">
                  <div>
                    <span className="font-pixel text-xs text-deep block">
                      {w.guestName}
                    </span>
                    <span className="font-retro text-sm text-vintage">
                      {w.guestRelationship} • Towards {w.goalTitle} (
                      {formatIndianRupees(w.amount)})
                    </span>
                  </div>

                  <button
                    onClick={() => toggleStar(w.id)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title={w.starred ? "Unstar wish" : "Star wish"}
                  >
                    {w.starred ? "★" : "☆"}
                  </button>
                </div>

                <p className="font-retro text-xl leading-relaxed text-deep italic">
                  &ldquo;{w.message}&rdquo;
                </p>

                <div className="text-right text-xs font-retro text-deep/60">
                  {new Date(w.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </PixelCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
