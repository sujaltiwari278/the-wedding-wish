"use client";

import React, { useState, useEffect } from "react";
import { IGoal, GoalCategory } from "@/types";
import { paiseToRupees } from "@/lib/money";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelInput, PixelTextarea, PixelSelect } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon, AVAILABLE_GOAL_ICONS } from "@/components/icons/PixelIcons";

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: {
    id?: string;
    title: string;
    description: string;
    category: GoalCategory;
    targetRupees: number;
    image: string;
  }) => Promise<void>;
  editingGoal?: IGoal | null;
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string }[] = [
  { value: "Travel", label: "✈ Travel & Honeymoon" },
  { value: "Home", label: "🏠 First Home Down Payment" },
  { value: "Kitchen", label: "🍳 Dream Kitchen & Appliances" },
  { value: "Furniture", label: "🛋 Furniture & Interiors" },
  { value: "Experience", label: "🌟 Special Experience" },
  { value: "Other", label: "🎁 Other Wedding Wish" },
];

export function GoalFormModal({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}: GoalFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Travel");
  const [targetRupees, setTargetRupees] = useState<number | "">("");
  const [image, setImage] = useState("plane");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description);
      setCategory(editingGoal.category);
      setTargetRupees(paiseToRupees(editingGoal.targetAmount));
      setImage(editingGoal.image || "plane");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Travel");
      setTargetRupees("");
      setImage("plane");
    }
    setError("");
  }, [editingGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a title for this dream.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description so guests know what they are funding.");
      return;
    }
    const numAmount = Number(targetRupees);
    if (isNaN(numAmount) || numAmount < 100) {
      setError("Target amount must be at least ₹100.");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        id: editingGoal ? editingGoal._id.toString() : undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        targetRupees: numAmount,
        image,
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to save goal. Please check inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? "EDIT WEDDING DREAM" : "NEW WEDDING DREAM"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg">
            ⚠ {error}
          </div>
        )}

        <PixelInput
          label="Dream Title"
          placeholder="e.g. Europe Honeymoon"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PixelSelect
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as GoalCategory)}
            options={CATEGORY_OPTIONS}
          />

          <PixelInput
            label="Target Amount (₹)"
            type="number"
            placeholder="e.g. 150000"
            min={100}
            step="any"
            value={targetRupees}
            onChange={(e) =>
              setTargetRupees(e.target.value === "" ? "" : Number(e.target.value))
            }
            hint="Minimum amount: ₹100"
            required
          />
        </div>

        {/* Pixel Icon Selector */}
        <div className="space-y-1.5">
          <label className="block font-pixel text-[11px] text-deep uppercase tracking-wider">
            Choose Pixel Icon
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_GOAL_ICONS.map((icon) => {
              const isSelected = image === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setImage(icon.id)}
                  title={icon.label}
                  className={`p-2 border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-vintage text-cream border-deep shadow-pixel translate-y-[-2px]"
                      : "bg-cream text-deep border-deep hover:bg-blush shadow-pixel-sm"
                  }`}
                >
                  <PixelIcon name={icon.id} size={24} />
                </button>
              );
            })}
          </div>
        </div>

        <PixelTextarea
          label="Why this dream matters"
          placeholder="Share why this goal is close to your hearts..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-3 border-t-2 border-deep/20">
          <PixelButton type="button" variant="ghost" onClick={onClose} size="sm">
            Cancel
          </PixelButton>
          <PixelButton
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
          >
            {editingGoal ? "UPDATE DREAM" : "CREATE DREAM"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}
