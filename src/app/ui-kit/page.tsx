"use client";

import React, { useState } from "react";
import {
  PixelButton,
} from "@/components/ui/PixelButton";
import {
  PixelCard,
  PixelCardHeader,
  PixelCardContent,
  PixelCardFooter,
} from "@/components/ui/PixelCard";
import {
  PixelInput,
  PixelTextarea,
  PixelSelect,
} from "@/components/ui/PixelInput";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelToast } from "@/components/ui/PixelToast";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { PixelEmptyState } from "@/components/ui/PixelEmptyState";

export default function UiKitPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [progressVal, setProgressVal] = useState(65);

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-12">
      {/* Header */}
      <div className="border-b-4 border-deep pb-6 space-y-2">
        <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
          Design System v1.0
        </div>
        <h1 className="text-2xl md:text-3xl font-pixel text-deep leading-snug">
          THE WEDDING WISH UI KIT
        </h1>
        <p className="font-retro text-2xl text-vintage">
          100% Retro 2D Pixel-Art Indian Wedding Aesthetic
        </p>
      </div>

      {/* Palette Reference */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Palette Tokens (Strict 6-Color System)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-rose-dusty p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">rose-dusty</span>
            <span className="font-retro text-base font-bold">#D8A7A7</span>
          </div>
          <div className="bg-blush p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">blush</span>
            <span className="font-retro text-base font-bold">#EBCACA</span>
          </div>
          <div className="bg-soft-blush p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">soft-blush</span>
            <span className="font-retro text-base font-bold">#F7E9E5</span>
          </div>
          <div className="bg-cream p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">cream</span>
            <span className="font-retro text-base font-bold">#FFF7F2</span>
          </div>
          <div className="bg-vintage text-cream p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">vintage</span>
            <span className="font-retro text-base font-bold">#9C5968</span>
          </div>
          <div className="bg-deep text-cream p-3 border-2 border-deep shadow-pixel-sm text-center">
            <span className="font-pixel text-[9px] block">deep</span>
            <span className="font-retro text-base font-bold">#75404F</span>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Pixel Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <PixelButton variant="primary" size="lg">
            Primary Large
          </PixelButton>
          <PixelButton variant="primary" size="md">
            Primary
          </PixelButton>
          <PixelButton variant="secondary" size="md">
            Secondary
          </PixelButton>
          <PixelButton variant="ghost" size="md">
            Ghost
          </PixelButton>
          <PixelButton variant="danger" size="md">
            Danger
          </PixelButton>
          <PixelButton variant="primary" size="sm">
            Small
          </PixelButton>
          <PixelButton variant="primary" isLoading size="md">
            Loading
          </PixelButton>
          <PixelButton variant="primary" disabled size="md">
            Disabled
          </PixelButton>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Pixel Badges
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <PixelBadge variant="active">Active</PixelBadge>
          <PixelBadge variant="completed">Completed</PixelBadge>
          <PixelBadge variant="archived">Archived</PixelBadge>
          <PixelBadge variant="shagun">Shagun Envelope</PixelBadge>
          <PixelBadge variant="neutral">Draft</PixelBadge>
        </div>
      </section>

      {/* Segmented Progress Bars */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Segmented Retro Progress Bars
        </h2>
        <div className="space-y-4 bg-soft-blush p-6 border-2 border-deep shadow-pixel">
          <div className="flex items-center gap-4">
            <label className="font-pixel text-xs">Adjust Progress:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="accent-vintage"
            />
            <span className="font-pixel text-xs text-vintage">{progressVal}%</span>
          </div>

          <PixelProgressBar progress={progressVal} segments={10} variant="vintage" />
          <PixelProgressBar progress={progressVal} segments={20} variant="dusty" size="sm" />
          <PixelProgressBar progress={100} segments={10} variant="deep" size="lg" />
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">Pixel Tabs</h2>
        <PixelTabs
          tabs={[
            { id: "all", label: "All Dreams", count: 4 },
            { id: "active", label: "In Progress", count: 3 },
            { id: "completed", label: "Achieved", count: 1 },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <p className="font-retro text-lg text-deep/80">
          Currently viewing tab: <span className="font-bold uppercase font-pixel text-xs text-vintage">{activeTab}</span>
        </p>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Pixel Inputs & Form Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-soft-blush p-6 border-2 border-deep shadow-pixel">
          <PixelInput
            label="Wedding Code"
            placeholder="e.g. AMAR2026"
            hint="8-character uppercase identifier"
          />
          <PixelInput
            label="Target Amount (₹)"
            placeholder="1,50,000"
            error="Amount must be at least ₹100"
          />
          <PixelSelect
            label="Dream Category"
            options={[
              { value: "travel", label: "✈ Travel & Honeymoon" },
              { value: "home", label: "🏠 First Home Down Payment" },
              { value: "kitchen", label: "🍳 Dream Kitchen & Appliances" },
              { value: "furniture", label: "🛋 Furniture & Interiors" },
            ]}
          />
          <PixelTextarea
            label="Couple Intro"
            rows={3}
            placeholder="A short message for your guests..."
          />
        </div>
      </section>

      {/* Cards & Modal */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Pixel Cards & Dialogs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PixelCard variant="default">
            <PixelCardHeader>
              <span>Europe Honeymoon</span>
              <PixelBadge variant="active" size="sm">Active</PixelBadge>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="font-retro text-xl">
                Exploring cobblestone streets, local cafes, and the Swiss Alps.
              </p>
              <PixelProgressBar progress={75} />
            </PixelCardContent>
            <PixelCardFooter>
              <span className="font-pixel text-xs text-vintage font-bold">
                ₹1,12,500 / ₹1,50,000
              </span>
              <PixelButton size="sm" onClick={() => setModalOpen(true)}>
                Inspect
              </PixelButton>
            </PixelCardFooter>
          </PixelCard>

          <PixelCard variant="cream">
            <PixelCardHeader>
              <span>Quick Actions</span>
            </PixelCardHeader>
            <PixelCardContent className="space-y-3">
              <p className="font-retro text-xl">
                Interact with the notification toast and modal dialog system.
              </p>
              <div className="flex gap-3">
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                >
                  Open Modal
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setToastVisible(true)}
                >
                  Trigger Toast
                </PixelButton>
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="font-pixel text-sm uppercase text-deep">
          Pixel Empty State
        </h2>
        <PixelEmptyState
          title="No Shagun Received Yet"
          description="Share your unique wedding code or QR envelope with friends and family to see blessings arrive."
          action={
            <PixelButton variant="primary" size="md">
              Share Wedding Code
            </PixelButton>
          }
        />
      </section>

      {/* Interactive Modal */}
      <PixelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Inspect Goal: Europe Honeymoon"
      >
        <div className="space-y-4">
          <p className="font-retro text-xl">
            This is a retro pixel-styled modal dialog with stepped shadows and pixel borders.
          </p>
          <div className="p-3 bg-cream border-2 border-deep">
            <p className="font-pixel text-[10px] text-vintage mb-1">
              STATUS: ON TRACK (75%)
            </p>
            <p className="font-retro text-lg">
              Target: ₹1,50,000 | Collected: ₹1,12,500
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Close
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Save Changes
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      {/* Interactive Toast */}
      {toastVisible && (
        <PixelToast
          type="success"
          message="★ Pixel Toast: Changes saved successfully to the wedding ledger!"
          onClose={() => setToastVisible(false)}
        />
      )}
    </main>
  );
}
