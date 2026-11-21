"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IGoal, GoalCategory } from "@/types";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelEmptyState } from "@/components/ui/PixelEmptyState";
import { PixelToast } from "@/components/ui/PixelToast";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export default function GoalsManagementPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<IGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<IGoal | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error("Fetch goals error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreateOrUpdate = async (goalData: {
    id?: string;
    title: string;
    description: string;
    category: GoalCategory;
    targetRupees: number;
    image: string;
  }) => {
    if (goalData.id) {
      // Edit
      const res = await fetch(`/api/goals/${goalData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      setToastMessage("Wedding dream updated successfully!");
    } else {
      // Create
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      setToastMessage("New wedding dream added to your registry!");
    }
    await fetchGoals();
  };

  const handleDelete = async () => {
    if (!deletingGoal) return;
    setIsActionPending(true);
    try {
      const res = await fetch(`/api/goals/${deletingGoal._id.toString()}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToastMessage(`Removed "${deletingGoal.title}" from your realm.`);
        await fetchGoals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
      setDeletingGoal(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "completed" | "archived"
  ) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setToastMessage(`Dream marked as ${status}!`);
        await fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSpotlight = async (id: string, isSpotlight: boolean) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSpotlight }),
      });
      if (res.ok) {
        setToastMessage(
          isSpotlight
            ? "★ Dream highlighted as Spotlight on public page!"
            : "Removed Spotlight highlight."
        );
        await fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const currentIndex = goals.findIndex((g) => g._id.toString() === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= goals.length) return;

    const reordered = [...goals];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setGoals(reordered);

    const orderedIds = reordered.map((g) => g._id.toString());
    try {
      await fetch("/api/goals/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedExamples = async () => {
    setIsActionPending(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_examples" }),
      });
      if (res.ok) {
        setToastMessage("Loaded 4 example wedding dreams!");
        await fetchGoals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (activeTab === "active") return g.status === "active";
    if (activeTab === "completed") return g.status === "completed";
    if (activeTab === "archived") return g.status === "archived";
    return true;
  });

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;
  const archivedCount = goals.filter((g) => g.status === "archived").length;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/dashboard" label="← DASHBOARD" />
        </div>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
              FINANCIAL GOALS REGISTRY
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel text-deep">
              OUR WEDDING DREAMS
            </h1>
            <p className="font-retro text-2xl text-deep/80">
              Set clear targets so shagun goes directly towards what matters most.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {goals.length === 0 && (
              <PixelButton
                variant="secondary"
                size="md"
                onClick={handleSeedExamples}
                isLoading={isActionPending}
              >
                Load Example Goals ✦
              </PixelButton>
            )}

            <PixelButton
              variant="primary"
              size="md"
              onClick={() => {
                setEditingGoal(null);
                setIsModalOpen(true);
              }}
            >
              + ADD NEW DREAM
            </PixelButton>
          </div>
        </div>

        {/* Tabs */}
        <PixelTabs
          tabs={[
            { id: "all", label: "All Dreams", count: goals.length },
            { id: "active", label: "In Progress", count: activeCount },
            { id: "completed", label: "Achieved", count: completedCount },
            { id: "archived", label: "Archived", count: archivedCount },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Goals List */}
        {isLoading ? (
          <div className="py-16 text-center font-pixel text-xs text-vintage animate-pulse">
            LOADING REALM DREAMS...
          </div>
        ) : filteredGoals.length === 0 ? (
          <PixelEmptyState
            title="No Goals In This Category"
            description="Create your first wedding dream or load the example registry goals."
            action={
              <div className="flex gap-3">
                <PixelButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setEditingGoal(null);
                    setIsModalOpen(true);
                  }}
                >
                  Create A Dream
                </PixelButton>
                {goals.length === 0 && (
                  <PixelButton
                    variant="secondary"
                    size="md"
                    onClick={handleSeedExamples}
                  >
                    Load 4 Examples
                  </PixelButton>
                )}
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal, index) => (
              <GoalCard
                key={goal._id.toString()}
                goal={goal}
                isFirst={index === 0}
                isLast={index === filteredGoals.length - 1}
                onEdit={(g) => {
                  setEditingGoal(g);
                  setIsModalOpen(true);
                }}
                onDelete={(g) => setDeletingGoal(g)}
                onMoveUp={(id) => handleMove(id, "up")}
                onMoveDown={(id) => handleMove(id, "down")}
                onStatusChange={handleStatusChange}
                onToggleSpotlight={handleToggleSpotlight}
              />
            ))}
          </div>
        )}
      </main>

      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        editingGoal={editingGoal}
      />

      {/* Delete Confirmation Modal */}
      <PixelModal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        title="CONFIRM REMOVAL"
      >
        <div className="space-y-4">
          <p className="font-retro text-xl">
            Are you sure you want to remove{" "}
            <span className="font-pixel text-xs text-vintage">
              &quot;{deletingGoal?.title}&quot;
            </span>{" "}
            from your wedding registry?
          </p>
          <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-base">
            ⚠ Any shagun already attributed to this goal will remain preserved in
            your ledger history.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setDeletingGoal(null)}
            >
              Cancel
            </PixelButton>
            <PixelButton
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isActionPending}
            >
              YES, DELETE
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      {/* Toast Notification */}
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
