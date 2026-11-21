"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatRupees } from "@/lib/money";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelTextarea } from "@/components/ui/PixelInput";
import { PixelToast } from "@/components/ui/PixelToast";

type ToneOption = "Heartfelt" | "Funny" | "Formal" | "Hinglish";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  contribution: {
    id: string;
    guestName: string;
    guestMobile: string;
    amount: number;
    goalTitle: string;
    guestMessage?: string;
    thankYouSent?: boolean;
  } | null;
  onMarkSent?: (id: string) => void;
}

export function ThankYouModal({
  isOpen,
  onClose,
  contribution,
  onMarkSent,
}: ThankYouModalProps) {
  const [tone, setTone] = useState<ToneOption>("Heartfelt");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const generateMessage = useCallback(async (selectedTone: ToneOption) => {
    if (!contribution) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/thank-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: contribution.guestName,
          amountRupees: contribution.amount / 100,
          goalTitle: contribution.goalTitle,
          guestWish: contribution.guestMessage || "",
          tone: selectedTone,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [contribution]);

  useEffect(() => {
    if (isOpen && contribution) {
      setTone("Heartfelt");
      generateMessage("Heartfelt");
    }
  }, [isOpen, contribution, generateMessage]);

  if (!contribution) return null;

  const handleToneChange = (newTone: ToneOption) => {
    setTone(newTone);
    generateMessage(newTone);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setToastMessage("Copied thank-you message to clipboard!");
  };

  const handleSendWhatsApp = () => {
    // Strip non-digits from mobile
    const digits = contribution.guestMobile.replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`, "_blank");
  };

  const handleConfirmSent = async () => {
    setIsMarking(true);
    try {
      const res = await fetch(`/api/contributions/${contribution.id}/thank-you`, {
        method: "PATCH",
      });
      if (res.ok) {
        setToastMessage("Marked thank-you as sent!");
        onMarkSent?.(contribution.id);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <>
      <PixelModal
        isOpen={isOpen}
        onClose={onClose}
        title={`THANK YOU: ${contribution.guestName.toUpperCase()}`}
      >
        <div className="space-y-4">
          {/* Contribution summary banner */}
          <div className="bg-cream border-2 border-deep p-3 space-y-1">
            <div className="flex justify-between items-baseline font-pixel text-xs">
              <span className="text-deep">{contribution.guestName}</span>
              <span className="text-vintage font-bold">
                {formatRupees(contribution.amount / 100)}
              </span>
            </div>
            <div className="font-retro text-sm text-deep/70">
              Contributed towards: <strong>{contribution.goalTitle}</strong>
            </div>
            {contribution.guestMessage && (
              <p className="font-retro text-base italic text-deep/85 pt-1 border-t border-deep/15">
                Wish: &ldquo;{contribution.guestMessage}&rdquo;
              </p>
            )}
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="block font-pixel text-[10px] text-deep uppercase tracking-wider">
              Choose Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Heartfelt", "Funny", "Formal", "Hinglish"] as ToneOption[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToneChange(t)}
                    className={`font-pixel text-[10px] py-1.5 px-2 border-2 select-none transition-all ${
                      tone === t
                        ? "bg-vintage text-cream border-deep shadow-pixel-sm translate-y-[-1px]"
                        : "bg-cream text-deep border-deep hover:bg-blush"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Editable AI Message */}
          <div className="space-y-1.5">
            <PixelTextarea
              label="Editable Thank-You Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isGenerating}
            />
            {isGenerating && (
              <span className="font-pixel text-[9px] text-vintage animate-pulse block">
                ◆ AI CRAFTING WARM WORDS...
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t-2 border-deep/20">
            <div className="flex gap-2">
              <PixelButton
                size="sm"
                variant="ghost"
                onClick={() => generateMessage(tone)}
                disabled={isGenerating}
              >
                Regenerate ↺
              </PixelButton>
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={copyToClipboard}
              >
                Copy 📋
              </PixelButton>
            </div>

            <div className="flex gap-2">
              <PixelButton
                size="sm"
                variant="primary"
                onClick={handleSendWhatsApp}
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-deep border-deep"
              >
                SEND ON WHATSAPP 💬
              </PixelButton>

              <PixelButton
                size="sm"
                variant="ghost"
                onClick={handleConfirmSent}
                isLoading={isMarking}
              >
                {contribution.thankYouSent ? "Already Sent ✓" : "Mark as Sent ✓"}
              </PixelButton>
            </div>
          </div>
        </div>
      </PixelModal>

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
