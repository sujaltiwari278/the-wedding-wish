"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelToast } from "@/components/ui/PixelToast";

interface QuickShareStripProps {
  weddingCode: string;
  profileSlug: string;
}

export function QuickShareStrip({
  weddingCode,
  profileSlug,
}: QuickShareStripProps) {
  const [toastMessage, setToastMessage] = useState("");

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicUrl = `${origin}/wedding/${profileSlug}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Copied ${label} to clipboard!`);
  };

  return (
    <>
      <div className="bg-soft-blush border-3 border-deep p-4 shadow-pixel flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 border-2 border-deep bg-cream flex items-center justify-center text-lg shadow-pixel-sm">
            🔗
          </div>
          <div>
            <span className="font-pixel text-[9px] text-vintage uppercase block">
              QUICK SHARE STRIP
            </span>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-deep font-bold">
                CODE: {weddingCode}
              </span>
              <button
                onClick={() => copy(weddingCode, "Wedding Code")}
                className="font-pixel text-[9px] bg-cream border border-deep px-1.5 py-0.5 hover:bg-blush"
              >
                COPY
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            onClick={() => copy(publicUrl, "Profile Link")}
            className="font-pixel text-[10px] bg-cream border-2 border-deep px-3 py-1.5 shadow-pixel-sm hover:bg-blush active:translate-y-[1px]"
          >
            COPY LINK 📋
          </button>
          <Link href={`/wedding/${profileSlug}`} target="_blank">
            <PixelButton size="sm" variant="secondary">
              PUBLIC VIEW ↗
            </PixelButton>
          </Link>
          <Link href="/profile">
            <PixelButton size="sm" variant="primary">
              QR CODE 📱
            </PixelButton>
          </Link>
        </div>
      </div>

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
