"use client";

import React from "react";
import { IGoal } from "@/types";
import { formatIndianRupees, calculateProgressPercentage } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/icons/PixelIcons";

interface GoalExplorerProps {
  goals: (IGoal & { contributorCount?: number })[];
  selectedGoalId: string | null;
  onSelectGoal: (goal: IGoal) => void;
}

export function GoalExplorer({
  goals,
  selectedGoalId,
  onSelectGoal,
}: GoalExplorerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b-2 border-deep/20 pb-2">
        <h3 className="font-pixel text-xs text-deep uppercase tracking-wider">
          CHOOSE A WEDDING DREAM TO BLESS
        </h3>
        <span className="font-retro text-lg text-deep/70">
          {goals.filter((g) => g.status === "active").length} active dreams
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isSelected = selectedGoalId === goal._id.toString();
          const isCompleted = goal.status === "completed";
          const progress = calculateProgressPercentage(
            goal.collectedAmount || 0,
            goal.targetAmount
          );

          return (
            <PixelCard
              key={goal._id.toString()}
              variant={isSelected ? "blush" : "default"}
              shadow={isSelected ? "lg" : "sm"}
              className={`transition-all ${
                isSelected ? "border-vintage ring-2 ring-vintage" : ""
              } ${isCompleted ? "opacity-80" : ""}`}
            >
              <PixelCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-2 border-deep bg-cream flex items-center justify-center text-vintage shadow-pixel-sm">
                    <PixelIcon name={goal.image || "heart"} size={20} />
                  </div>
                  <div>
                    <h4 className="font-pixel text-xs text-deep">{goal.title}</h4>
                    <span className="font-retro text-base text-deep/70">
                      {goal.category}
                    </span>
                  </div>
                </div>

                {isCompleted ? (
                  <PixelBadge variant="completed" size="sm">
                    Fully Funded ✓
                  </PixelBadge>
                ) : (
                  <PixelBadge variant="active" size="sm">
                    {progress}% Funded
                  </PixelBadge>
                )}
              </PixelCardHeader>

              <PixelCardContent className="space-y-3">
                <p className="font-retro text-lg text-deep/85 line-clamp-2">
                  {goal.description}
                </p>

                {/* Numbers */}
                <div className="bg-cream p-2.5 border-2 border-deep/60 space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-pixel text-[9px] text-vintage">
                      {formatIndianRupees(goal.collectedAmount || 0)}
                    </span>
                    <span className="font-pixel text-[9px] text-deep/70">
                      TARGET: {formatIndianRupees(goal.targetAmount)}
                    </span>
                  </div>
                  <PixelProgressBar progress={progress} segments={10} size="sm" />
                </div>
              </PixelCardContent>

              <PixelCardFooter>
                <span className="font-retro text-base text-deep/70">
                  {goal.contributorCount || 0} blessings received
                </span>

                {isCompleted ? (
                  <span className="font-pixel text-[10px] text-vintage">
                    DREAM ACHIEVED 🎉
                  </span>
                ) : (
                  <PixelButton
                    size="sm"
                    variant={isSelected ? "primary" : "secondary"}
                    onClick={() => onSelectGoal(goal)}
                  >
                    {isSelected ? "SELECTED ✓" : "SELECT DREAM"}
                  </PixelButton>
                )}
              </PixelCardFooter>
            </PixelCard>
          );
        })}
      </div>
    </div>
  );
}
