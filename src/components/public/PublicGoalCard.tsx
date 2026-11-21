import React from "react";
import Link from "next/link";
import { IGoal } from "@/types";
import { formatIndianRupees, calculateProgressPercentage } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/icons/PixelIcons";

interface PublicGoalCardProps {
  goal: IGoal & {
    contributorCount?: number;
    recentSupporters?: string[];
  };
  weddingCode: string;
}

export function PublicGoalCard({ goal, weddingCode }: PublicGoalCardProps) {
  const progressPercent = calculateProgressPercentage(
    goal.collectedAmount || 0,
    goal.targetAmount
  );

  const goalId = goal._id.toString();
  const isCompleted = goal.status === "completed";

  return (
    <PixelCard
      variant={goal.isSpotlight ? "blush" : "default"}
      shadow="md"
      className={`space-y-4 relative ${
        goal.isSpotlight ? "ring-2 ring-vintage border-vintage" : ""
      }`}
    >
      {/* Spotlight Ribbon */}
      {goal.isSpotlight && (
        <div className="absolute -top-3 left-4 bg-vintage text-cream border-2 border-deep px-2 py-0.5 font-pixel text-[8px] uppercase tracking-wider shadow-pixel-sm">
          ★ COUPLE&apos;S SPOTLIGHT DREAM
        </div>
      )}

      {/* Header */}
      <PixelCardHeader className={goal.isSpotlight ? "pt-2" : ""}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-deep bg-cream flex items-center justify-center text-vintage shadow-pixel-sm">
            <PixelIcon name={goal.image || "heart"} size={22} />
          </div>
          <div>
            <h3 className="font-pixel text-xs text-deep tracking-wider">
              {goal.title}
            </h3>
            <span className="font-retro text-base text-deep/70">
              {goal.category} Wish
            </span>
          </div>
        </div>

        <PixelBadge
          variant={isCompleted ? "completed" : "active"}
          size="sm"
        >
          {isCompleted ? "Goal Reached! 🎉" : "In Progress"}
        </PixelBadge>
      </PixelCardHeader>

      {/* Description */}
      <PixelCardContent className="space-y-3">
        <p className="font-retro text-lg text-deep/85 leading-relaxed">
          {goal.description}
        </p>

        {/* Progress & Numbers */}
        <div className="bg-cream border-2 border-deep/60 p-3 shadow-pixel-sm space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-pixel text-[9px] text-vintage uppercase block">
                SHAGUN GATHERED
              </span>
              <span className="font-pixel text-base text-deep font-bold">
                {formatIndianRupees(goal.collectedAmount || 0)}
              </span>
            </div>
            <div className="text-right">
              <span className="font-pixel text-[9px] text-deep/70 uppercase block">
                GOAL TARGET
              </span>
              <span className="font-pixel text-xs text-deep/90">
                {formatIndianRupees(goal.targetAmount)}
              </span>
            </div>
          </div>

          <PixelProgressBar progress={progressPercent} segments={10} variant="vintage" />
        </div>

        {/* Group Gifting Presentation: Contributor Count & Recent Supporters */}
        <div className="flex items-center justify-between text-deep/75 font-retro text-base border-t border-deep/15 pt-2">
          <span>
            {goal.contributorCount
              ? `👥 ${goal.contributorCount} ${
                  goal.contributorCount === 1 ? "person has" : "people have"
                } contributed`
              : "Be the first to bless this dream!"}
          </span>
          {goal.recentSupporters && goal.recentSupporters.length > 0 && (
            <span className="text-xs text-vintage truncate max-w-[180px]">
              Blessed by {goal.recentSupporters.slice(0, 2).join(", ")}
            </span>
          )}
        </div>
      </PixelCardContent>

      {/* Footer CTA */}
      <PixelCardFooter>
        <span className="font-retro text-base text-deep/75">
          {progressPercent}% towards this dream
        </span>
        {isCompleted ? (
          <span className="font-pixel text-[10px] text-vintage font-bold">
            FULLY FUNDED ✓
          </span>
        ) : (
          <Link href={`/guest?code=${weddingCode}&goal=${goalId}`}>
            <PixelButton variant="primary" size="md">
              SEND SHAGUN 🎁
            </PixelButton>
          </Link>
        )}
      </PixelCardFooter>
    </PixelCard>
  );
}
