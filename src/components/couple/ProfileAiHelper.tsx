"use client";

import React, { useState } from "react";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelButton } from "@/components/ui/PixelButton";

interface ProfileAiHelperProps {
  coupleStory?: string;
  onSelectDescription: (desc: string) => void;
}

export function ProfileAiHelper({
  coupleStory,
  onSelectDescription,
}: ProfileAiHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<
    { id: string; style: string; description: string }[]
  >([]);

  const handleOpenAndFetch = async () => {
    setIsOpen(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/profile-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleStory }),
      });

      const data = await res.json();
      if (res.ok) {
        setOptions(data.options || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenAndFetch}
        className="font-pixel text-[10px] text-vintage hover:underline flex items-center gap-1.5"
      >
        <span>✦</span>
        <span>HELP ME WRITE THIS WITH AI</span>
      </button>

      <PixelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="AI INTRO DESCRIPTION IDEAS"
      >
        <div className="space-y-4">
          <p className="font-retro text-lg text-deep/80">
            Pick your favourite intro message below. You can customize it on your
            profile before saving!
          </p>

          {isLoading ? (
            <div className="py-10 text-center font-pixel text-xs text-vintage animate-pulse">
              CRAFTING WEDDING BLESSINGS...
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3.5 bg-cream border-2 border-deep space-y-2 hover:border-vintage transition-colors"
                >
                  <div className="flex justify-between items-center border-b border-deep/15 pb-1">
                    <span className="font-pixel text-[9px] text-vintage uppercase font-bold">
                      {opt.style}
                    </span>
                    <span className="font-retro text-xs text-deep/60">
                      {opt.description.length}/200 chars
                    </span>
                  </div>
                  <p className="font-retro text-lg text-deep leading-relaxed">
                    &ldquo;{opt.description}&rdquo;
                  </p>
                  <div className="flex justify-end pt-1">
                    <PixelButton
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => {
                        onSelectDescription(opt.description);
                        setIsOpen(false);
                      }}
                    >
                      Use This Intro ✦
                    </PixelButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t-2 border-deep/20">
            <button
              type="button"
              onClick={handleOpenAndFetch}
              disabled={isLoading}
              className="font-pixel text-[10px] text-vintage hover:underline disabled:opacity-50"
            >
              Regenerate New Ideas ↺
            </button>
            <PixelButton
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Close
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </>
  );
}
