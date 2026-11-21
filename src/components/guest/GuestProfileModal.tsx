"use client";

import React, { useState } from "react";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelInput, PixelSelect } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";

interface GuestProfileModalProps {
  isOpen: boolean;
  onSaved: (guest: { fullName: string; email?: string; relationship?: string }) => void;
  couplePartnerNames?: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: "Family", label: "Family / Relative" },
  { value: "Friend", label: "Close Friend" },
  { value: "Colleague", label: "Work Colleague" },
  { value: "Neighbour", label: "Neighbour / Community" },
  { value: "Other", label: "Well-Wisher / Other" },
];

export function GuestProfileModal({
  isOpen,
  onSaved,
  couplePartnerNames = "the couple",
}: GuestProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Friend");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please provide your full name so the couple knows who sent blessings.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/guest/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          relationship,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save profile details");
      } else {
        onSaved({
          fullName: data.guest.fullName,
          email: data.guest.email,
          relationship: data.guest.relationship,
        });
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PixelModal isOpen={isOpen} onClose={() => {}} title="WELCOME, HONOURED GUEST!">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-cream border-2 border-deep space-y-1">
          <p className="font-retro text-lg text-deep/85 leading-relaxed">
            Please share your name so {couplePartnerNames} can attribute your
            shagun envelope and send heartfelt thank-yous!
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-base">
            ⚠ {error}
          </div>
        )}

        <PixelInput
          label="Your Full Name"
          placeholder="e.g. Ramesh Sharma"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          hint="Appears on the couple's shagun ledger and receipt"
        />

        <PixelInput
          label="Email Address (Optional)"
          type="email"
          placeholder="ramesh@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="To receive a copy of your shagun receipt"
        />

        <PixelSelect
          label="Relationship to the Couple"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          options={RELATIONSHIP_OPTIONS}
        />

        <div className="pt-2">
          <PixelButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            CONTINUE TO SHAGUN REGISTRY ✦
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}
