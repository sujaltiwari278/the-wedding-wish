"use client";

import React, { useState } from "react";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelToast } from "@/components/ui/PixelToast";

interface SettingsFormProps {
  initialSettings: {
    showWishesPublicly: boolean;
    partnerOneName: string;
    partnerTwoName: string;
    email: string;
    mobileNumber: string;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [showWishes, setShowWishes] = useState(initialSettings.showWishesPublicly);
  const [partnerOne, setPartnerOne] = useState(initialSettings.partnerOneName);
  const [partnerTwo, setPartnerTwo] = useState(initialSettings.partnerTwoName);
  const [mobile, setMobile] = useState(initialSettings.mobileNumber);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/couple/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showWishesPublicly: showWishes,
          partnerOneName: partnerOne,
          partnerTwoName: partnerTwo,
          mobileNumber: mobile,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update settings");
      } else {
        setToastMessage("Settings updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error updating settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-base">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Privacy Settings */}
        <PixelCard variant="default" shadow="sm">
          <PixelCardHeader>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>PRIVACY & PUBLIC REGISTRY VISIBILITY</span>
            </div>
          </PixelCardHeader>
          <PixelCardContent className="space-y-3">
            <div className="p-3 bg-cream border-2 border-deep flex items-center justify-between">
              <div>
                <span className="font-pixel text-xs block text-deep">
                  Display Guest Blessings Publicly
                </span>
                <span className="font-retro text-base text-deep/70">
                  When enabled, guest first names and wishes appear on your public
                  wedding registry. (Amounts & phone numbers are never shown).
                </span>
              </div>
              <input
                type="checkbox"
                checked={showWishes}
                onChange={(e) => setShowWishes(e.target.checked)}
                className="w-5 h-5 accent-vintage cursor-pointer"
              />
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Contact Info */}
        <PixelCard variant="default" shadow="sm">
          <PixelCardHeader>
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>COUPLE CONTACT DETAILS</span>
            </div>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Partner 1 Name"
                value={partnerOne}
                onChange={(e) => setPartnerOne(e.target.value)}
                required
              />
              <PixelInput
                label="Partner 2 Name"
                value={partnerTwo}
                onChange={(e) => setPartnerTwo(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Account Email"
                value={initialSettings.email}
                disabled
                hint="Contact platform administrator to change primary email"
              />
              <PixelInput
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Change Password */}
        <PixelCard variant="default" shadow="sm">
          <PixelCardHeader>
            <div className="flex items-center gap-2">
              <span>🔑</span>
              <span>CHANGE PASSWORD (OPTIONAL)</span>
            </div>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <PixelInput
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PixelInput
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </PixelCardContent>
        </PixelCard>

        <div className="flex justify-end pt-2">
          <PixelButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
          >
            SAVE ALL SETTINGS ✓
          </PixelButton>
        </div>
      </form>

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
