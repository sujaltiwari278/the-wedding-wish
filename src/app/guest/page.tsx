"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IGoal } from "@/types";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { WeddingCountdown } from "@/components/couple/WeddingCountdown";
import { OtpVerificationModal } from "@/components/guest/OtpVerificationModal";
import { GuestProfileModal } from "@/components/guest/GuestProfileModal";
import { GoalExplorer } from "@/components/guest/GoalExplorer";
import { ContributionFlow } from "@/components/guest/ContributionFlow";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

interface CouplePreview {
  id: string;
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  profileSlug: string;
  weddingDescription: string;
}

interface GuestSessionData {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  relationship?: string;
  isProfileComplete?: boolean;
}

function GuestPortalContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const initialGoalId = searchParams.get("goal") || null;

  const [weddingCodeInput, setWeddingCodeInput] = useState(initialCode);
  const [resolvedCouple, setResolvedCouple] = useState<CouplePreview | null>(null);
  const [goals, setGoals] = useState<(IGoal & { contributorCount?: number })[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);

  // Guest auth states
  const [guestSession, setGuestSession] = useState<GuestSessionData | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mobileInput, setMobileInput] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // 1. Check existing guest session on mount (returning guests skip OTP!)
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/guest/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.guest) {
          setGuestSession(data.guest);
        }
      }
    } catch (err) {
      console.error("Session check error:", err);
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 2. Fetch goals for resolved couple
  const fetchCoupleGoals = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/guest/goals?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
        if (initialGoalId && data.goals) {
          const match = data.goals.find(
            (g: IGoal) => g._id.toString() === initialGoalId
          );
          if (match && match.status === "active") {
            setSelectedGoal(match);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  }, [initialGoalId]);

  // 3. Resolve Wedding Code
  const handleResolveCode = useCallback(
    async (codeToResolve: string) => {
      if (!codeToResolve.trim()) return;
      setIsLoadingCode(true);
      setCodeError("");

      try {
        const res = await fetch("/api/guest/resolve-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weddingCode: codeToResolve }),
        });

        const data = await res.json();
        if (!res.ok) {
          setCodeError(data.error || "Invalid wedding code. Please try again.");
          setResolvedCouple(null);
        } else {
          setResolvedCouple(data.couple);
          fetchCoupleGoals(data.couple.profileSlug);
        }
      } catch (err) {
        console.error(err);
        setCodeError("Failed to lookup wedding code.");
      } finally {
        setIsLoadingCode(false);
      }
    },
    [fetchCoupleGoals]
  );

  // Auto-resolve if initialCode present from QR link
  useEffect(() => {
    if (initialCode) {
      handleResolveCode(initialCode);
    }
  }, [initialCode, handleResolveCode]);

  // 4. Send Mobile OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setOtpError("");

    try {
      const res = await fetch("/api/guest/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobileInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to send OTP.");
      } else {
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setOtpError("Network error sending OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerified = (guest: {
    id: string;
    fullName: string;
    isNewUser: boolean;
  }) => {
    setIsOtpModalOpen(false);
    setGuestSession({
      id: guest.id,
      fullName: guest.fullName,
      mobileNumber: mobileInput,
    });

    if (guest.isNewUser || !guest.fullName) {
      setIsProfileModalOpen(true);
    }
  };

  const handleProfileSaved = (updated: { fullName: string }) => {
    setIsProfileModalOpen(false);
    if (guestSession) {
      setGuestSession({
        ...guestSession,
        fullName: updated.fullName,
        isProfileComplete: true,
      });
    }
  };

  const handleGuestLogout = async () => {
    await fetch("/api/guest/session", { method: "DELETE" });
    setGuestSession(null);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Header */}
      <header className="bg-soft-blush border-b-4 border-deep px-4 py-3 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-pixel text-xs text-deep font-bold tracking-wider">
              THE WEDDING WISH
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {guestSession ? (
              <div className="flex items-center gap-2">
                <span className="font-retro text-base text-deep hidden sm:inline">
                  Namaste, <strong>{guestSession.fullName || "Guest"}</strong>
                </span>
                <Link href="/guest/history">
                  <PixelButton size="sm" variant="secondary" className="px-2 py-1 text-[9px] sm:text-[10px]">
                    My Blessings 📜
                  </PixelButton>
                </Link>
                <LogoutButton
                  variant="ghost"
                  size="sm"
                  label="Exit"
                  className="px-2 py-1 text-[9px] text-vintage"
                />
              </div>
            ) : (
              <span className="font-pixel text-[10px] text-vintage">
                GUEST SHAGUN PORTAL
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          {resolvedCouple ? (
            <PixelBackButton
              onClick={() => {
                setResolvedCouple(null);
                setSelectedGoal(null);
              }}
              label="← CHANGE CODE"
            />
          ) : (
            <PixelBackButton href="/" label="← HOME" />
          )}
        </div>

        {/* Step 1: Wedding Code Entry (if not yet resolved) */}
        {!resolvedCouple ? (
          <div className="max-w-md mx-auto space-y-6 pt-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 border-3 border-deep bg-soft-blush mx-auto flex items-center justify-center text-3xl shadow-pixel">
                ✉
              </div>
              <h1 className="font-pixel text-xl md:text-2xl text-deep">
                ENTER WEDDING CODE
              </h1>
              <p className="font-retro text-2xl text-deep/80">
                Type the 8-character code from your invitation or QR card
              </p>
            </div>

            <PixelCard variant="default" shadow="lg">
              <PixelCardContent>
                {codeError && (
                  <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg mb-4">
                    ⚠ {codeError}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleResolveCode(weddingCodeInput);
                  }}
                  className="space-y-4"
                >
                  <PixelInput
                    label="Wedding Code"
                    placeholder="e.g. 7A9B3C2D"
                    maxLength={10}
                    value={weddingCodeInput}
                    onChange={(e) => setWeddingCodeInput(e.target.value)}
                    hint="Case-insensitive, spaces or hyphens are ignored"
                    required
                  />

                  <div className="pt-2">
                    <PixelButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoadingCode}
                      className="w-full"
                    >
                      ENTER WEDDING REALM ✦
                    </PixelButton>
                  </div>
                </form>
              </PixelCardContent>
            </PixelCard>
          </div>
        ) : (
          /* Couple Resolved */
          <div className="space-y-8">
            {/* Couple Realm Banner */}
            <div className="bg-soft-blush border-3 border-deep p-6 shadow-pixel space-y-3 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-deep/20 pb-3">
                <div>
                  <span className="font-pixel text-[9px] text-vintage uppercase tracking-wider block">
                    GUEST REGISTRY
                  </span>
                  <h1 className="text-2xl md:text-3xl font-pixel text-deep">
                    {resolvedCouple.partnerOneName} & {resolvedCouple.partnerTwoName}
                  </h1>
                </div>

                <button
                  onClick={() => {
                    setResolvedCouple(null);
                    setSelectedGoal(null);
                  }}
                  className="font-pixel text-[9px] text-vintage hover:underline self-start sm:self-center"
                >
                  Change Code ↺
                </button>
              </div>

              {resolvedCouple.weddingDescription && (
                <p className="font-retro text-2xl text-vintage italic">
                  &ldquo;{resolvedCouple.weddingDescription}&rdquo;
                </p>
              )}

              <WeddingCountdown
                weddingDate={resolvedCouple.weddingDate}
                variant="compact"
              />
            </div>

            {/* Check if Guest is Authenticated */}
            {isCheckingSession ? (
              <div className="py-12 text-center font-pixel text-xs text-vintage animate-pulse">
                CHECKING GUEST BLESSING CREDENTIALS...
              </div>
            ) : !guestSession ? (
              /* Mobile OTP Verification Screen */
              <PixelCard variant="cream" shadow="md" className="max-w-md mx-auto">
                <PixelCardHeader>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>VERIFY MOBILE TO SEND SHAGUN</span>
                  </div>
                </PixelCardHeader>
                <PixelCardContent className="space-y-4">
                  <p className="font-retro text-xl text-deep/85 leading-relaxed">
                    Indian weddings are built on personal blessings! Enter your
                    mobile number to receive a 6-digit verification code.
                  </p>

                  {otpError && (
                    <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-base">
                      ⚠ {otpError}
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <PixelInput
                      label="Indian Mobile Number"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={15}
                      required
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      hint="Enter 10-digit mobile number (+91 will be added automatically)"
                    />

                    <div className="pt-2">
                      <PixelButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSendingOtp}
                        className="w-full"
                      >
                        SEND 6-DIGIT OTP ✉
                      </PixelButton>
                    </div>
                  </form>
                </PixelCardContent>
              </PixelCard>
            ) : selectedGoal ? (
              /* Contribution Flow for Selected Goal */
              <ContributionFlow
                coupleId={resolvedCouple.id}
                coupleNames={`${resolvedCouple.partnerOneName} & ${resolvedCouple.partnerTwoName}`}
                selectedGoal={selectedGoal}
                guest={guestSession}
                onBackToGoals={() => setSelectedGoal(null)}
              />
            ) : (
              /* Goal Explorer */
              <GoalExplorer
                goals={goals}
                selectedGoalId={selectedGoal ? (selectedGoal as IGoal)._id.toString() : null}
                onSelectGoal={(goal) => setSelectedGoal(goal)}
              />
            )}
          </div>
        )}
      </main>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        mobileNumber={mobileInput}
        onVerified={handleOtpVerified}
      />

      {/* Guest Profile Step Modal (for first-time guests) */}
      <GuestProfileModal
        isOpen={isProfileModalOpen}
        onSaved={handleProfileSaved}
        couplePartnerNames={
          resolvedCouple
            ? `${resolvedCouple.partnerOneName} & ${resolvedCouple.partnerTwoName}`
            : "the couple"
        }
      />
    </div>
  );
}

export default function GuestPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center font-pixel text-xs text-vintage">
          LOADING REALM PORTAL...
        </div>
      }
    >
      <GuestPortalContent />
    </Suspense>
  );
}
