"use client";

import React, { useState } from "react";
import { GoalSuggestionItem } from "@/lib/ai";
import { formatRupees } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput, PixelTextarea, PixelSelect } from "@/components/ui/PixelInput";
import { PixelIcon } from "@/components/icons/PixelIcons";
import { GoalCategory } from "@/types";

interface GoalSuggestionCardProps {
  suggestion: GoalSuggestionItem;
  onAccept: (item: GoalSuggestionItem) => Promise<void>;
  onDismiss: () => void;
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: "Travel", label: "✈ Travel & Honeymoon" },
  { value: "Home", label: "🏠 First Home Down Payment" },
  { value: "Kitchen", label: "🍳 Dream Kitchen & Appliances" },
  { value: "Furniture", label: "🛋 Furniture & Interiors" },
  { value: "Experience", label: "🌟 Special Experience" },
  { value: "Other", label: "🎁 Other Wedding Wish" },
];

export function GoalSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: GoalSuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const [title, setTitle] = useState(suggestion.title);
  const [description, setDescription] = useState(suggestion.description);
  const [category, setCategory] = useState<GoalCategory>(suggestion.category);
  const [targetRupees, setTargetRupees] = useState(suggestion.suggestedTargetRupees);

  const handleSaveAndAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept({
        ...suggestion,
        title,
        description,
        category,
        suggestedTargetRupees: Number(targetRupees),
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <PixelCard variant="default" shadow="md" className="space-y-3 flex flex-col justify-between">
      <div>
        <PixelCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-deep bg-cream flex items-center justify-center text-vintage shadow-pixel-sm">
              <PixelIcon name={suggestion.image || "heart"} size={20} />
            </div>
            <div>
              <span className="font-pixel text-xs text-deep block">{title}</span>
              <span className="font-retro text-sm text-vintage">{category}</span>
            </div>
          </div>
          <PixelBadge variant="shagun" size="sm">
            AI Suggestion
          </PixelBadge>
        </PixelCardHeader>

        <PixelCardContent className="space-y-3">
          {isEditing ? (
            <div className="space-y-3 bg-cream p-3 border-2 border-deep">
              <PixelInput
                label="Dream Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <PixelSelect
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  options={CATEGORY_OPTIONS}
                />
                <PixelInput
                  label="Target (₹)"
                  type="number"
                  value={targetRupees}
                  onChange={(e) => setTargetRupees(Number(e.target.value))}
                />
              </div>
              <PixelTextarea
                label="Description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-retro text-lg text-deep/85 leading-relaxed">
                {description}
              </p>

              <div className="bg-cream border border-deep/40 p-2.5 flex justify-between items-center">
                <div>
                  <span className="font-pixel text-[9px] text-vintage block">
                    SUGGESTED TARGET
                  </span>
                  <span className="font-pixel text-sm text-deep font-bold">
                    {formatRupees(targetRupees)}
                  </span>
                </div>
                <span className="font-retro text-xs text-deep/60 max-w-[150px] text-right">
                  Derived from your budget
                </span>
              </div>

              {suggestion.reason && (
                <div className="p-2 bg-soft-blush border border-deep/20 text-deep font-retro text-base italic">
                  💡 {suggestion.reason}
                </div>
              )}
            </div>
          )}
        </PixelCardContent>
      </div>

      <PixelCardFooter className="pt-2">
        <div className="flex gap-2">
          {isEditing ? (
            <PixelButton
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Done Editing
            </PixelButton>
          ) : (
            <PixelButton
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              Edit ✎
            </PixelButton>
          )}

          <PixelButton size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </PixelButton>
        </div>

        <PixelButton
          size="sm"
          variant="primary"
          isLoading={isAccepting}
          onClick={handleSaveAndAccept}
        >
          ACCEPT DREAM ✓
        </PixelButton>
      </PixelCardFooter>
    </PixelCard>
  );
}
