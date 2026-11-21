"use client";

import React from "react";
import { IGoal } from "@/types";
import { formatIndianRupees, calculateProgressPercentage, paiseToRupees } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/icons/PixelIcons";

interface GoalCardProps {
  goal: IGoal;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (goal: IGoal) => void;
  onDelete: (goal: IGoal) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onStatusChange: (id: string, status: "active" | "completed" | "archived") => void;
  onToggleSpotlight?: (id: string, isSpotlight: boolean) => void;
}

export function GoalCard({
  goal,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onStatusChange,
  onToggleSpotlight,
}: GoalCardProps) {
  const goalId = goal._id.toString();
  const progressPercent = calculateProgressPercentage(
    goal.collectedAmount || 0,
    goal.targetAmount
  );

  const statusVariants: Record<string, "active" | "completed" | "archived"> = {
    active: "active",
    completed: "completed",
    archived: "archived",
  };

  return (
    <PixelCard variant="default" shadow="md" className="space-y-4">
      {/* Header */}
      <PixelCardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-deep bg-cream flex items-center justify-center text-vintage shadow-pixel-sm">
            <PixelIcon name={goal.image || "heart"} size={22} />
          </div>
          <div>
            <h3 className="font-pixel text-xs text-deep tracking-wider">{goal.title}</h3>
            <span className="font-retro text-base text-deep/70">
              {goal.category} Dream
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {goal.isSpotlight && (
            <PixelBadge variant="shagun" size="sm">
              ★ Spotlight
            </PixelBadge>
          )}

          <PixelBadge variant={statusVariants[goal.status] || "active"} size="sm">
            {goal.status}
          </PixelBadge>

          {/* Reordering Up/Down */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onMoveUp(goalId)}
              disabled={isFirst}
              title="Move Up"
              className="bg-cream border border-deep px-1 text-[8px] font-pixel disabled:opacity-30 hover:bg-blush active:translate-y-[-1px]"
            >
              ▲
            </button>
            <button
              onClick={() => onMoveDown(goalId)}
              disabled={isLast}
              title="Move Down"
              className="bg-cream border border-deep px-1 text-[8px] font-pixel disabled:opacity-30 hover:bg-blush active:translate-y-[1px]"
            >
              ▼
            </button>
          </div>
        </div>
      </PixelCardHeader>

      {/* Content */}
      <PixelCardContent className="space-y-3">
        <p className="font-retro text-lg text-deep/85 line-clamp-2">
          {goal.description}
        </p>

        {/* Progress Bar & Amounts */}
        <div className="space-y-2 bg-cream p-3 border-2 border-deep/60">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-pixel text-[9px] text-vintage uppercase block">
                COLLECTED SHAGUN
              </span>
              <span className="font-pixel text-base text-deep font-bold">
                {formatIndianRupees(goal.collectedAmount || 0)}
              </span>
            </div>
            <div className="text-right">
              <span className="font-pixel text-[9px] text-deep/70 uppercase block">
                TARGET GOAL
              </span>
              <span className="font-pixel text-xs text-deep/90">
                {formatIndianRupees(goal.targetAmount)}
              </span>
            </div>
          </div>

          <PixelProgressBar progress={progressPercent} segments={10} variant="vintage" />
        </div>
      </PixelCardContent>

      {/* Footer Actions */}
      <PixelCardFooter className="flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {goal.status === "active" && (
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(goalId, "completed")}
            >
              Mark Done ✓
            </PixelButton>
          )}
          {goal.status === "completed" && (
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(goalId, "active")}
            >
              Reopen ↺
            </PixelButton>
          )}
          {goal.status !== "archived" ? (
            <PixelButton
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(goalId, "archived")}
            >
              Archive
            </PixelButton>
          ) : (
            <PixelButton
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(goalId, "active")}
            >
              Unarchive
            </PixelButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleSpotlight && (
            <PixelButton
              size="sm"
              variant={goal.isSpotlight ? "secondary" : "ghost"}
              onClick={() => onToggleSpotlight(goalId, !goal.isSpotlight)}
              title={goal.isSpotlight ? "Remove from Spotlight" : "Highlight as Spotlight Goal"}
            >
              {goal.isSpotlight ? "★ Spotlight" : "☆ Spotlight"}
            </PixelButton>
          )}

          <PixelButton size="sm" variant="primary" onClick={() => onEdit(goal)}>
            Edit
          </PixelButton>
          <PixelButton size="sm" variant="danger" onClick={() => onDelete(goal)}>
            Delete
          </PixelButton>
        </div>
      </PixelCardFooter>
    </PixelCard>
  );
}
