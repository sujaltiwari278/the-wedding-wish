"use client";

import React, { useEffect, useState } from "react";
import { Sprite } from "@/components/animations/Sprite";
import { PixelHearts } from "@/components/animations/PixelHearts";
import { sound } from "@/lib/sound";

interface PaymentCelebrationHeaderProps {
  isSuccess: boolean;
  guestName?: string;
  goalTitle?: string;
}

export function PaymentCelebrationHeader({
  isSuccess,
  guestName,
  goalTitle,
}: PaymentCelebrationHeaderProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    setIsMuted(sound.isMuted());
  }, []);

  const handlePlaySound = () => {
    if (isSuccess) {
      sound.playShagunCoin();
      setTimeout(() => {
        sound.playCelebrationFanfare();
      }, 350);
      setSoundPlayed(true);
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative text-center space-y-4 pt-2">
      {/* Floating hearts layer if successful */}
      {isSuccess && (
        <div className="absolute inset-0 -top-8 h-48 pointer-events-none overflow-hidden z-0">
          <PixelHearts count={16} />
        </div>
      )}

      {/* Retro Animation Row */}
      <div className="relative z-10 flex items-center justify-center gap-6">
        {/* Envelope Sprite */}
        <div className="p-2 border-2 border-deep bg-soft-blush shadow-pixel-sm">
          <Sprite
            src="/sprites/shagun-envelope.svg"
            frameWidth={32}
            frameHeight={32}
            frameCount={4}
            fps={4}
            scale={2}
            loop={true}
            alt="Animated Shagun Envelope"
          />
        </div>

        {/* Celebrating Couple Sprite */}
        {isSuccess && (
          <div className="p-2 border-2 border-deep bg-soft-blush shadow-pixel-sm">
            <Sprite
              src="/sprites/couple-celebrate.svg"
              frameWidth={48}
              frameHeight={48}
              frameCount={4}
              fps={5}
              scale={1.5}
              loop={true}
              alt="Celebrating Couple"
            />
          </div>
        )}
      </div>

      {/* Badge & Headlines */}
      <div className="relative z-10 space-y-2">
        <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase">
          {isSuccess ? "✨ SHAGUN BLESSING RECEIVED ✨" : "PAYMENT STATUS"}
        </div>
        <h1 className="font-pixel text-xl md:text-2xl text-deep">
          {isSuccess ? "BLESSINGS BESTOWED!" : "PAYMENT INCOMPLETE"}
        </h1>
        <p className="font-retro text-2xl text-vintage max-w-md mx-auto">
          {isSuccess
            ? `Your shagun envelope has unlocked another step towards "${goalTitle || "the dream"}"!`
            : "This shagun transaction did not complete."}
        </p>
      </div>

      {/* Audio celebration button / mute toggle */}
      {isSuccess && (
        <div className="relative z-10 flex justify-center items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handlePlaySound}
            className="font-pixel text-[10px] px-3 py-1.5 bg-vintage text-cream border-2 border-deep shadow-pixel-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-transform"
          >
            {soundPlayed ? "🎵 REPLAY CHIME" : "🎵 PLAY CHIPTUNE JINGLE"}
          </button>
          <button
            type="button"
            onClick={handleToggleMute}
            className="font-pixel text-[10px] px-3 py-1.5 bg-soft-blush text-deep border-2 border-deep shadow-pixel-sm hover:bg-blush"
            title="Toggle Sound"
          >
            {isMuted ? "🔇 SOUND MUTED" : "🔊 SOUND ON"}
          </button>
        </div>
      )}
    </div>
  );
}
