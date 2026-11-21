import React from "react";
import { formatIndianRupees } from "@/lib/money";
import { PixelCard } from "@/components/ui/PixelCard";

interface MetricCardsProps {
  totalCollectedPaise: number;
  successfulContributions: number;
  uniqueContributors: number;
  activeGoalsCount: number;
}

export function MetricCards({
  totalCollectedPaise,
  successfulContributions,
  uniqueContributors,
  activeGoalsCount,
}: MetricCardsProps) {
  const cards = [
    {
      label: "TOTAL SHAGUN COLLECTED",
      value: formatIndianRupees(totalCollectedPaise),
      icon: "💰",
      hint: "From verified successful payments",
      color: "text-vintage",
    },
    {
      label: "SHAGUN BLESSINGS",
      value: successfulContributions.toString(),
      icon: "💌",
      hint: "Total contributions received",
      color: "text-deep",
    },
    {
      label: "GENEROUS CONTRIBUTORS",
      value: uniqueContributors.toString(),
      icon: "👥",
      hint: "Unique friends & family guests",
      color: "text-deep",
    },
    {
      label: "ACTIVE DREAMS",
      value: activeGoalsCount.toString(),
      icon: "🎯",
      hint: "Dreams currently seeking funding",
      color: "text-vintage",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <PixelCard key={i} variant="default" shadow="sm" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-deep/75 uppercase tracking-wider">
              {c.label}
            </span>
            <span className="text-xl">{c.icon}</span>
          </div>
          <div className={`font-pixel text-xl md:text-2xl font-bold ${c.color}`}>
            {c.value}
          </div>
          <p className="font-retro text-base text-deep/60">{c.hint}</p>
        </PixelCard>
      ))}
    </div>
  );
}
