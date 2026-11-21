"use client";

import React, { useState } from "react";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelInput, PixelTextarea } from "@/components/ui/PixelInput";
import { PixelToast } from "@/components/ui/PixelToast";
import { ProfileAiHelper } from "@/components/couple/ProfileAiHelper";

export interface CoupleProfileData {
  id: string;
  partnerOneName: string;
  partnerTwoName: string;
  email: string;
  mobileNumber: string;
  weddingDate: string | Date;
  weddingCode: string;
  profileSlug: string;
  weddingDescription: string;
  coupleStory?: string;
  profileImage?: string;
  showWishesPublicly?: boolean;
}

const AVATAR_OPTIONS = [
  { id: "avatar-couple-1", label: "Classic Bride & Groom", icon: "👰🤵" },
  { id: "avatar-couple-2", label: "Royal Garlands", icon: "👑✨" },
  { id: "avatar-couple-3", label: "Shagun Envelopes", icon: "💌💖" },
  { id: "avatar-couple-4", label: "Sweet Mandap", icon: "🌸🛕" },
];

export function ProfileForm({ initialData }: { initialData: CoupleProfileData }) {
  const [formData, setFormData] = useState({
    partnerOneName: initialData.partnerOneName,
    partnerTwoName: initialData.partnerTwoName,
    weddingDate: new Date(initialData.weddingDate).toISOString().split("T")[0],
    weddingDescription: initialData.weddingDescription,
    coupleStory: initialData.coupleStory || "",
    profileImage: initialData.profileImage || "avatar-couple-1",
    showWishesPublicly: initialData.showWishesPublicly ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarSelect = (avatarId: string) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: avatarId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/couple/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile");
      } else {
        setToastMessage("Profile saved successfully!");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Network error occurred while saving profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PixelCard variant="default" shadow="md">
        <PixelCardHeader>
          <div className="flex items-center gap-2">
            <span>⚙</span>
            <span>COUPLE REALM SETTINGS</span>
          </div>
        </PixelCardHeader>

        <PixelCardContent>
          {errorMessage && (
            <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg mb-4">
              ⚠ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block font-pixel text-[11px] text-deep uppercase tracking-wider">
                CHOOSE PIXEL REALM CREST
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = formData.profileImage === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`p-3 border-2 text-center transition-all duration-75 select-none ${
                        isSelected
                          ? "bg-vintage text-cream border-deep shadow-pixel translate-y-[-2px]"
                          : "bg-cream text-deep border-deep hover:bg-blush shadow-pixel-sm"
                      }`}
                    >
                      <div className="text-2xl mb-1">{avatar.icon}</div>
                      <span className="font-pixel text-[9px] block">
                        {avatar.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Partner 1 Name"
                name="partnerOneName"
                value={formData.partnerOneName}
                onChange={handleChange}
                required
              />
              <PixelInput
                label="Partner 2 Name"
                name="partnerTwoName"
                value={formData.partnerTwoName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Wedding Date */}
            <PixelInput
              label="Wedding Date"
              type="date"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              required
            />

            {/* Personalized Intro (Max 200 chars) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[11px] text-deep uppercase tracking-wider">
                  Personalized Intro ({formData.weddingDescription.length}/200 chars)
                </span>
                <ProfileAiHelper
                  coupleStory={formData.coupleStory}
                  onSelectDescription={(desc) =>
                    setFormData((prev) => ({
                      ...prev,
                      weddingDescription: desc,
                    }))
                  }
                />
              </div>
              <PixelTextarea
                name="weddingDescription"
                rows={3}
                maxLength={200}
                value={formData.weddingDescription}
                onChange={handleChange}
                hint="Appears prominently at the top of your public wedding registry."
                required
              />
            </div>

            {/* Couple Story */}
            <PixelTextarea
              label="Our Love Story (Optional)"
              name="coupleStory"
              rows={5}
              placeholder="Tell your guests how you met, your favourite adventures, and what this new chapter means to you..."
              value={formData.coupleStory}
              onChange={handleChange}
            />

            {/* Public Wishes Toggle */}
            <div className="p-3 bg-cream border-2 border-deep flex items-center justify-between">
              <div>
                <span className="font-pixel text-[11px] block uppercase text-deep">
                  Display Guest Wishes Publicly
                </span>
                <span className="font-retro text-base text-deep/70">
                  Allow other guests to read heartfelt wishes left with shagun.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.showWishesPublicly}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    showWishesPublicly: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-vintage cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <PixelButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
              >
                SAVE PROFILE CHANGES
              </PixelButton>
            </div>
          </form>
        </PixelCardContent>
      </PixelCard>

      {toastMessage && (
        <PixelToast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage("")}
        />
      )}
    </>
  );
}
