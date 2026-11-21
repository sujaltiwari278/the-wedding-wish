"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatRupees } from "@/lib/money";

interface GoalChartData {
  title: string;
  collectedRupees: number;
  targetRupees: number;
}

interface GoalBreakdownChartProps {
  data: GoalChartData[];
}

export function GoalBreakdownChart({ data }: GoalBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center font-retro text-lg text-deep/70">
        No goals created yet to chart.
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
        >
          <XAxis
            dataKey="title"
            stroke="#75404F"
            tick={{ fill: "#75404F", fontSize: 10, fontFamily: "monospace" }}
            interval={0}
            tickFormatter={(val) =>
              val.length > 8 ? `${val.substring(0, 7)}…` : val
            }
          />
          <YAxis
            stroke="#75404F"
            tick={{ fill: "#75404F", fontSize: 10, fontFamily: "monospace" }}
            tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF7F2",
              border: "2px solid #75404F",
              boxShadow: "3px 3px 0px #75404F",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{
              fontFamily: "monospace",
              fontSize: "10px",
              paddingTop: "15px",
            }}
          />
          <Bar
            name="Collected Shagun"
            dataKey="collectedRupees"
            fill="#9C5968" // vintage
            stroke="#75404F"
            strokeWidth={1}
          />
          <Bar
            name="Target Goal"
            dataKey="targetRupees"
            fill="#EBCACA" // blush
            stroke="#75404F"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
