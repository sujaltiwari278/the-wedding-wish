"use client";

import React, { useState, useEffect, useRef } from "react";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelButton } from "@/components/ui/PixelButton";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileNumber: string;
  onVerified: (guest: { id: string; fullName: string; isNewUser: boolean }) => void;
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  mobileNumber,
  onVerified,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(30);
    setDigits(["", "", "", "", "", ""]);
    setErrorMessage("");
    setIsLocked(false);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Focus first input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string) => {
    if (isLocked) return;

    // Handle paste of 6 digits
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      if (pasted.length > 0) {
        const newDigits = [...digits];
        pasted.forEach((char, i) => {
          if (index + i < 6) newDigits[index + i] = char;
        });
        setDigits(newDigits);
        const nextIdx = Math.min(5, index + pasted.length);
        inputRefs.current[nextIdx]?.focus();

        if (newDigits.every((d) => d !== "")) {
          submitOtp(newDigits.join(""));
        }
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      submitOtp(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (otpCode: string) => {
    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/guest/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to verify OTP.");
        if (res.status === 403 || data.error?.includes("locked")) {
          setIsLocked(true);
        }
      } else {
        onVerified({
          id: data.guest.id,
          fullName: data.guest.fullName,
          isNewUser: data.isNewUser,
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/guest/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to resend OTP.");
      } else {
        setCountdown(30);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="VERIFY MOBILE OTP">
      <div className="space-y-6 text-center">
        <div className="space-y-1">
          <p className="font-retro text-xl text-deep">
            Enter the 6-digit verification code dispatched to:
          </p>
          <div className="font-pixel text-sm text-vintage font-bold">
            {mobileNumber}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg text-left">
            ⚠ {errorMessage}
          </div>
        )}

        {/* 6 Box Inputs */}
        <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={isLocked || isVerifying}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-8 h-10 xs:w-9 xs:h-12 sm:w-12 sm:h-14 text-center font-pixel text-base xs:text-lg sm:text-xl bg-cream border-2 border-deep text-deep shadow-pixel-sm focus:border-vintage focus:shadow-[2px_2px_0px_#9C5968] outline-none disabled:opacity-40"
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-deep/20">
          <div className="font-retro text-lg text-deep/80">
            {countdown > 0 ? (
              <span>Resend code in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-pixel text-[10px] text-vintage hover:underline disabled:opacity-50"
              >
                RESEND OTP ↺
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <PixelButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              disabled={digits.some((d) => d === "") || isLocked}
              isLoading={isVerifying}
              onClick={() => submitOtp(digits.join(""))}
            >
              VERIFY ✓
            </PixelButton>
          </div>
        </div>
      </div>
    </PixelModal>
  );
}
