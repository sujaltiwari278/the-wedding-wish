"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoalSuggestionItem } from "@/lib/ai";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { GoalSuggestionCard } from "@/components/ai/GoalSuggestionCard";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelInput, PixelTextarea } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelToast } from "@/components/ui/PixelToast";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export default function AiGoalsPage() {
  const router = useRouter();

  const [budget, setBudget] = useState<number>(250000);
  const [travel, setTravel] = useState("Swiss Alps, Amalfi Coast, Northern Italy");
  const [interests, setInterests] = useState("Foodie feasts, outdoor hiking, interior design");
  const [futurePlans, setFuturePlans] = useState("Moving into our first apartment next year");
  const [household, setHousehold] = useState("Espresso bar, cozy living room sofa, copper cookware");
  const [lifestyle, setLifestyle] = useState("Hosting family dinners and cozy weekend brunches");

  const [isLoading, setIsLoading] = useState(false);
  const [disclaimer, setDisclaimer] = useState("");
  const [suggestions, setSuggestions] = useState<GoalSuggestionItem[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalBudgetRupees: Number(budget),
          travelDestinations: travel,
          interests,
          futurePlans,
          householdNeeds: household,
          lifestyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to generate suggestions");
      } else {
        setSuggestions(data.suggestions || []);
        setDisclaimer(data.disclaimer || "Estimates based on your own budget.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error generating goal suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptGoal = async (item: GoalSuggestionItem) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          category: item.category,
          targetRupees: item.suggestedTargetRupees,
          image: item.image,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save goal");
      }

      setToastMessage(`★ Accepted "${item.title}" into your real wedding dreams!`);
      // Remove accepted suggestion from board
      setSuggestions((prev) => prev.filter((s) => s.title !== item.title));
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add dream to registry.");
    }
  };

  const handleDismiss = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/dashboard" label="← DASHBOARD" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
              AI WEDDING ASSISTANT
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel text-deep">
              INTELLIGENT GOAL CREATOR
            </h1>
            <p className="font-retro text-2xl text-deep/80">
              Personalized registry ideas tailored to your budget, plans, and cultural dreams.
            </p>
          </div>

          <Link href="/goals">
            <PixelButton size="sm" variant="secondary">
              View Active Dreams →
            </PixelButton>
          </Link>
        </div>

        {/* Questionnaire Form */}
        <PixelCard variant="default" shadow="md">
          <PixelCardHeader>
            <div className="flex items-center gap-2">
              <span>🔮</span>
              <span>COUPLE PREFERENCE QUESTIONNAIRE</span>
            </div>
          </PixelCardHeader>

          <PixelCardContent>
            {errorMessage && (
              <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-base mb-4">
                ⚠ {errorMessage}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PixelInput
                  label="Approximate Overall Registry Budget (₹)"
                  type="number"
                  min={1000}
                  step={5000}
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  hint="All AI goal suggestions are derived strictly from this budget"
                />

                <PixelInput
                  label="Dream Honeymoon Destinations"
                  placeholder="e.g. Swiss Alps, Japan, Bali, Amalfi Coast"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PixelInput
                  label="Shared Interests & Passions"
                  placeholder="e.g. Scuba diving, coffee, cooking, photography"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />

                <PixelInput
                  label="Future Plans & Milestones"
                  placeholder="e.g. First apartment down payment, pet adoption"
                  value={futurePlans}
                  onChange={(e) => setFuturePlans(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PixelTextarea
                  label="Household & Living Room Wishes"
                  rows={2}
                  placeholder="e.g. Solid wood dining table, espresso machine"
                  value={household}
                  onChange={(e) => setHousehold(e.target.value)}
                />

                <PixelTextarea
                  label="Hospitality & Lifestyle Style"
                  rows={2}
                  placeholder="e.g. Sunday brunches with friends, festival gatherings"
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  GENERATE DREAM SUGGESTIONS ✦
                </PixelButton>
              </div>
            </form>
          </PixelCardContent>
        </PixelCard>

        {/* Results Section */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-deep/20 pb-2">
              <h2 className="font-pixel text-sm text-deep uppercase tracking-wider">
                CURATED GOAL SUGGESTIONS ({suggestions.length})
              </h2>
              <span className="font-retro text-sm text-vintage italic">
                {disclaimer}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <GoalSuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onAccept={handleAcceptGoal}
                  onDismiss={() => handleDismiss(index)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {toastMessage && (
        <PixelToast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
}
