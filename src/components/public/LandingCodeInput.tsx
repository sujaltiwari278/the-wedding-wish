"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { sound } from "@/lib/sound";

export function LandingCodeInput() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    sound.playClickBeep();
    router.push(`/guest?code=${encodeURIComponent(clean)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <PixelInput
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. WISH2027"
          maxLength={12}
          className="uppercase tracking-widest text-center font-pixel text-xs bg-cream"
        />
      </div>
      <PixelButton type="submit" variant="primary" size="md">
        GO →
      </PixelButton>
    </form>
  );
}
