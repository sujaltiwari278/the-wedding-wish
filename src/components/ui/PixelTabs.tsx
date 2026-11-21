"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface PixelTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function PixelTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: PixelTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-b-2 border-deep/20 pb-2",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "font-pixel text-[11px] uppercase tracking-wider px-4 py-2 border-2 select-none transition-all duration-75",
              isActive
                ? "bg-vintage text-cream border-deep shadow-pixel translate-y-[-2px]"
                : "bg-cream text-deep border-deep/60 hover:bg-soft-blush shadow-pixel-sm active:translate-y-0"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "ml-2 text-[9px] px-1.5 py-0.5 border border-deep",
                  isActive ? "bg-cream text-deep" : "bg-blush text-deep"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
