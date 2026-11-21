"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatRupees } from "@/lib/money";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelBackButton } from "@/components/ui/PixelBackButton";
import { BudgetPlanResponse } from "@/lib/ai";

const COLORS = ["#9C5968", "#D8A7A7", "#75404F", "#EBCACA", "#B44C43", "#548235"];

export default function AiBudgetPage() {
  const [plan, setPlan] = useState<BudgetPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlan = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/budget");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load budget plan");
      } else {
        setPlan(data);
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading AI budget plan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const chartData = plan
    ? plan.categories.map((c) => ({
        name: c.category,
        value: c.allocatedRupees,
      }))
    : [];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/ai/goals" label="← AI GOALS" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
              FINANCIAL GUIDANCE
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel text-deep">
              AI WEDDING BUDGET PLANNER
            </h1>
            <p className="font-retro text-2xl text-deep/80">
              Structured shagun allocation insights and strategic financial milestones.
            </p>
          </div>

          <div className="flex gap-2">
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={fetchPlan}
              disabled={isLoading}
            >
              Recalculate ↺
            </PixelButton>
            <Link href="/goals">
              <PixelButton size="sm" variant="primary">
                Manage Dreams →
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-soft-blush border-2 border-deep p-3.5 shadow-pixel-sm flex items-center gap-3">
          <span className="text-2xl">⚖</span>
          <p className="font-retro text-lg text-deep/85">
            <strong>Mandatory Notice:</strong>{" "}
            {plan?.disclaimer ||
              "Guidance only, not financial advice. All estimates are derived strictly from your input data."}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center font-pixel text-xs text-vintage animate-pulse">
            ANALYZING REGISTRY DREAMS & BUDGET TARGETS...
          </div>
        ) : error ? (
          <PixelCard variant="default">
            <div className="text-center py-8 space-y-3">
              <span className="text-3xl">⚠</span>
              <p className="font-retro text-xl text-deep">{error}</p>
              <PixelButton size="sm" variant="primary" onClick={fetchPlan}>
                Try Again
              </PixelButton>
            </div>
          </PixelCard>
        ) : plan ? (
          <div className="space-y-6">
            {/* Top Metric & Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PixelCard variant="default" shadow="sm" className="space-y-1">
                <span className="font-pixel text-[9px] text-vintage uppercase block">
                  TOTAL ESTIMATED VALUE
                </span>
                <span className="font-pixel text-2xl text-deep font-bold">
                  {formatRupees(plan.totalEstimatedRupees)}
                </span>
                <span className="font-retro text-base text-deep/70 block">
                  Sum of your active registry dreams
                </span>
              </PixelCard>

              <PixelCard
                variant="cream"
                shadow="sm"
                className="md:col-span-2 space-y-1"
              >
                <span className="font-pixel text-[9px] text-vintage uppercase block">
                  AI STRATEGIC OBSERVATION
                </span>
                <p className="font-retro text-xl text-deep leading-relaxed">
                  {plan.overallGuidance}
                </p>
              </PixelCard>
            </div>

            {/* Chart + Allocation List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocation Pie Chart */}
              <PixelCard variant="default" shadow="md">
                <PixelCardHeader>
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>BUDGET DISTRIBUTION BREAKDOWN</span>
                  </div>
                </PixelCardHeader>
                <PixelCardContent>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          stroke="#75404F"
                          strokeWidth={2}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFF7F2",
                            border: "2px solid #75404F",
                            boxShadow: "3px 3px 0px #75404F",
                            fontFamily: "monospace",
                            fontSize: "12px",
                          }}
                          formatter={(val: number) => [formatRupees(val), ""]}
                        />
                        <Legend
                          wrapperStyle={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </PixelCardContent>
              </PixelCard>

              {/* Priorities & Tips */}
              <PixelCard variant="cream" shadow="md" className="space-y-4">
                <PixelCardHeader>
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <span>PRIORITIES & SAVING TIPS</span>
                  </div>
                </PixelCardHeader>
                <PixelCardContent className="space-y-3">
                  {plan.categories.map((cat, i) => (
                    <div
                      key={i}
                      className="p-3 bg-soft-blush border-2 border-deep space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-pixel text-xs text-deep">
                          {cat.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-[10px] text-vintage font-bold">
                            {formatRupees(cat.allocatedRupees)} ({cat.percentage}%)
                          </span>
                          <PixelBadge
                            variant={
                              cat.priority === "High"
                                ? "active"
                                : cat.priority === "Medium"
                                ? "shagun"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {cat.priority}
                          </PixelBadge>
                        </div>
                      </div>
                      <p className="font-retro text-base text-deep/80 pt-1">
                        {cat.tips}
                      </p>
                    </div>
                  ))}
                </PixelCardContent>
              </PixelCard>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
