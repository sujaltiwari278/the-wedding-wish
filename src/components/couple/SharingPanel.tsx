"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelToast } from "@/components/ui/PixelToast";

interface SharingPanelProps {
  weddingCode: string;
  profileSlug: string;
  qrDataUrl: string;
}

export function SharingPanel({
  weddingCode,
  profileSlug,
  qrDataUrl,
}: SharingPanelProps) {
  const [toastMessage, setToastMessage] = useState("");
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicUrl = `${origin}/wedding/${profileSlug}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Copied ${label} to clipboard!`);
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `WeddingWish_QR_${weddingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("QR Code PNG downloaded!");
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste! We are thrilled to invite you into our wedding journey. Instead of traditional gifts, we've created our dream registry on The Wedding Wish: ${publicUrl} (Wedding Code: ${weddingCode}). Your blessings mean the world to us!`
  );

  return (
    <>
      <PixelCard variant="default" shadow="md" className="space-y-6">
        <PixelCardHeader>
          <div className="flex items-center gap-2">
            <span>✉</span>
            <span>SHAGUN INVITATION & SHARING</span>
          </div>
        </PixelCardHeader>

        <PixelCardContent className="space-y-6">
          {/* Main Grid: Code + Links & QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Code & URL */}
            <div className="space-y-4">
              {/* Wedding Code Box */}
              <div className="bg-cream border-3 border-deep p-3 sm:p-4 shadow-pixel-sm space-y-1">
                <span className="font-pixel text-[10px] text-vintage uppercase tracking-wider block">
                  UNIQUE WEDDING CODE
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-pixel text-xl sm:text-2xl md:text-3xl text-deep tracking-widest select-all break-all">
                    {weddingCode}
                  </span>
                  <PixelButton
                    size="sm"
                    variant="primary"
                    onClick={() => copyToClipboard(weddingCode, "Wedding Code")}
                  >
                    COPY
                  </PixelButton>
                </div>
                <p className="font-retro text-base text-deep/70 pt-1">
                  Guests can enter this code at the kiosk or guest portal.
                </p>
              </div>

              {/* Public URL Box */}
              <div className="bg-cream border-2 border-deep p-3 sm:p-4 shadow-pixel-sm space-y-1">
                <span className="font-pixel text-[10px] text-vintage uppercase tracking-wider block">
                  PUBLIC REGISTRY LINK
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
                  <span className="font-retro text-base sm:text-lg text-deep truncate select-all">
                    /wedding/{profileSlug}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <PixelButton
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(publicUrl, "Registry Link")}
                    >
                      COPY
                    </PixelButton>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <PixelButton size="sm" variant="ghost">
                        VISIT ↗
                      </PixelButton>
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <PixelButton
                  variant="primary"
                  size="md"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-deep border-deep"
                >
                  SHARE ON WHATSAPP 💬
                </PixelButton>
              </a>
            </div>

            {/* Right: Pixel Framed QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-cream border-3 border-deep shadow-pixel text-center space-y-3">
              <span className="font-pixel text-[11px] text-deep uppercase tracking-wider">
                SCAN TO GIVE SHAGUN
              </span>

              {/* Retro QR Display Container */}
              <div className="p-3 bg-warm-cream border-4 border-deep relative inline-block">
                <div className="absolute top-1 left-1 text-[8px] font-pixel text-deep">◤</div>
                <div className="absolute top-1 right-1 text-[8px] font-pixel text-deep">◥</div>
                <div className="absolute bottom-1 left-1 text-[8px] font-pixel text-deep">◣</div>
                <div className="absolute bottom-1 right-1 text-[8px] font-pixel text-deep">◢</div>
                <Image
                  src={qrDataUrl}
                  alt="Wedding QR Code"
                  width={180}
                  height={180}
                  className="pixel-art mx-auto"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <PixelButton
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadQr}
                >
                  DOWNLOAD PNG 💾
                </PixelButton>
              </div>
            </div>
          </div>
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
