"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IGoal } from "@/types";
import { formatRupees } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelInput, PixelTextarea } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelToast } from "@/components/ui/PixelToast";

interface ContributionFlowProps {
  coupleId: string;
  coupleNames: string;
  selectedGoal: IGoal;
  guest: {
    id: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
  };
  onBackToGoals: () => void;
}

const AMOUNT_CHIPS = [501, 1001, 2001, 5001];

const SAMPLE_WISHES = [
  "Wishing you both a lifetime of love and happiness!",
  "May your new beginning be filled with beautiful memories!",
  "So thrilled to celebrate your special journey together!",
  "Congratulations and warmest shagun blessings!",
];

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: unknown) => RazorpayInstance;
  }
}

export function ContributionFlow({
  coupleId,
  coupleNames,
  selectedGoal,
  guest,
  onBackToGoals,
}: ContributionFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState<"configure" | "review">("configure");
  const [amount, setAmount] = useState<number | "">(1001);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [guestMessage, setGuestMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [simulatedCheckoutOpen, setSimulatedCheckoutOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string;
    amount: number;
    transactionId: string;
  } | null>(null);

  const selectedAmount = isCustom ? Number(customAmount) : Number(amount);

  const handleChipSelect = (val: number) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomChange = (val: string) => {
    setIsCustom(true);
    setCustomAmount(val);
    setAmount("");
  };

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedAmount || isNaN(selectedAmount) || selectedAmount < 1) {
      setErrorMessage("Please select or enter a valid shagun amount (minimum ₹1).");
      return;
    }
    if (selectedAmount > 500000) {
      setErrorMessage("Maximum single shagun amount is ₹5,00,000.");
      return;
    }

    setStep("review");
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleId,
          goalId: selectedGoal._id.toString(),
          amountRupees: selectedAmount,
          guestMessage: guestMessage.trim(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setErrorMessage(orderData.error || "Failed to create payment order");
        setIsProcessing(false);
        return;
      }

      const { orderId, amount: amountPaise, keyId, transactionId } = orderData;

      // Check if real keys or placeholder test mode
      const isPlaceholder = !keyId || keyId.includes("placeholder");

      if (isPlaceholder) {
        // Open retro test checkout simulator
        setPendingOrder({ orderId, amount: amountPaise, transactionId });
        setSimulatedCheckoutOpen(true);
        setIsProcessing(false);
        return;
      }

      // Load official Razorpay Checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage("Failed to load Razorpay payment gateway SDK.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: "INR",
        name: "The Wedding Wish",
        description: `Shagun for ${coupleNames} - ${selectedGoal.title}`,
        order_id: orderId,
        prefill: {
          name: guest.fullName,
          contact: guest.mobileNumber,
          email: guest.email || "",
        },
        theme: {
          color: "#9C5968",
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          await verifyAndCompletePayment(response);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected payment error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const verifyAndCompletePayment = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setIsProcessing(true);
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setErrorMessage(verifyData.error || "Payment verification failed.");
        setIsProcessing(false);
      } else {
        // Payment successful! Navigate to confirmation receipt
        router.push(`/payment/confirmation/${verifyData.transactionId}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during payment verification.");
      setIsProcessing(false);
    }
  };

  const handleSimulatedSuccess = async () => {
    if (!pendingOrder) return;
    setSimulatedCheckoutOpen(false);

    await verifyAndCompletePayment({
      razorpay_order_id: pendingOrder.orderId,
      razorpay_payment_id: `pay_simulated_${Date.now()}`,
      razorpay_signature: "simulated_valid_test_signature_12345",
    });
  };

  return (
    <>
      <PixelCard variant="default" shadow="md" className="space-y-6">
        <PixelCardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xl">💌</span>
              <span>PREPARE SHAGUN ENVELOPE</span>
            </div>
            <button
              onClick={onBackToGoals}
              className="font-pixel text-[10px] text-vintage hover:underline"
            >
              ← CHANGE GOAL
            </button>
          </div>
        </PixelCardHeader>

        <PixelCardContent>
          {errorMessage && (
            <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg mb-4">
              ⚠ {errorMessage}
            </div>
          )}

          {step === "configure" ? (
            <form onSubmit={handleNextToReview} className="space-y-6">
              {/* Selected Goal Preview */}
              <div className="bg-cream border-2 border-deep p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    ATTRIBUTED DREAM
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-deep truncate block">
                    {selectedGoal.title}
                  </span>
                  <span className="font-retro text-base text-deep/70 block">
                    {selectedGoal.category} Wish for {coupleNames}
                  </span>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="font-pixel text-[9px] text-deep/70 uppercase block">
                    TARGET
                  </span>
                  <span className="font-pixel text-xs text-deep">
                    {formatRupees(selectedGoal.targetAmount / 100)}
                  </span>
                </div>
              </div>

              {/* Shagun Amount Selector */}
              <div className="space-y-3">
                <label className="block font-pixel text-[11px] text-deep uppercase tracking-wider">
                  SELECT SHAGUN AMOUNT
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {AMOUNT_CHIPS.map((chip) => {
                    const isChipSelected = !isCustom && amount === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipSelect(chip)}
                        className={`p-2.5 sm:p-3 border-2 font-pixel text-xs transition-all duration-75 select-none min-h-[44px] flex items-center justify-center ${
                          isChipSelected
                            ? "bg-vintage text-cream border-deep shadow-pixel translate-y-[-2px]"
                            : "bg-cream text-deep border-deep hover:bg-blush shadow-pixel-sm"
                        }`}
                      >
                        ₹{chip.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount */}
                <div className="pt-2">
                  <PixelInput
                    label="Or Enter Custom Amount (₹)"
                    type="number"
                    placeholder="e.g. 2500"
                    min={1}
                    max={500000}
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    hint="Traditional Indian shagun amounts often end in 1 (e.g. ₹501, ₹1001, ₹2501)"
                  />
                </div>
              </div>

              {/* Wish Message */}
              <div className="space-y-2">
                <PixelTextarea
                  label={`Leave A Personal Wish (${guestMessage.length}/300 chars)`}
                  rows={3}
                  maxLength={300}
                  placeholder="Share a sweet memory, wedding wish, or blessing for the couple..."
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                />

                {/* Quick Wish Suggestion Chips */}
                <div className="space-y-1">
                  <span className="font-pixel text-[9px] text-deep/70 uppercase block">
                    Quick Blessing Ideas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_WISHES.map((wish, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGuestMessage(wish)}
                        className="font-retro text-sm bg-cream border border-deep/40 px-2 py-0.5 hover:bg-blush text-deep text-left"
                      >
                        &ldquo;{wish}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <PixelButton type="submit" variant="primary" size="lg" className="w-full">
                  REVIEW SHAGUN ENVELOPE →
                </PixelButton>
              </div>
            </form>
          ) : (
            /* Review Step */
            <div className="space-y-6">
              <div className="bg-cream border-3 border-deep p-6 shadow-pixel space-y-4">
                <div className="text-center border-b-2 border-deep/20 pb-4 space-y-1">
                  <span className="font-pixel text-[10px] text-vintage uppercase tracking-widest block">
                    SHAGUN LIFAFA SUMMARY
                  </span>
                  <span className="font-pixel text-2xl md:text-3xl text-deep font-bold">
                    ₹{selectedAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2 font-retro text-xl">
                  <div className="flex justify-between border-b border-deep/10 pb-1">
                    <span className="text-deep/70">For the Couple:</span>
                    <span className="font-pixel text-xs text-deep">{coupleNames}</span>
                  </div>
                  <div className="flex justify-between border-b border-deep/10 pb-1">
                    <span className="text-deep/70">Dream Funded:</span>
                    <span className="font-pixel text-xs text-deep">
                      {selectedGoal.title}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-deep/10 pb-1">
                    <span className="text-deep/70">From Contributor:</span>
                    <span className="font-pixel text-xs text-deep">{guest.fullName}</span>
                  </div>
                  {guestMessage && (
                    <div className="pt-2">
                      <span className="text-deep/70 block text-base font-pixel">
                        Attached Blessing:
                      </span>
                      <p className="p-3 bg-soft-blush border border-deep text-deep mt-1 italic">
                        &ldquo;{guestMessage}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <PixelButton
                  variant="ghost"
                  size="md"
                  disabled={isProcessing}
                  onClick={() => setStep("configure")}
                >
                  ← Edit Envelope
                </PixelButton>
                <PixelButton
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  isLoading={isProcessing}
                  onClick={handleInitiatePayment}
                >
                  PAY WITH RAZORPAY 💳
                </PixelButton>
              </div>
            </div>
          )}
        </PixelCardContent>
      </PixelCard>

      {/* Retro Test Checkout Simulator (Active when using test placeholder keys) */}
      <PixelModal
        isOpen={simulatedCheckoutOpen}
        onClose={() => setSimulatedCheckoutOpen(false)}
        title="RAZORPAY TEST PAYMENT SIMULATOR"
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-cream border-2 border-deep space-y-2">
            <span className="font-pixel text-[10px] text-vintage uppercase block">
              TEST GATEWAY MODE
            </span>
            <div className="font-pixel text-xl text-deep">
              ₹{selectedAmount.toLocaleString("en-IN")}
            </div>
            <p className="font-retro text-base text-deep/70">
              Order ID: {pendingOrder?.orderId}
            </p>
            <p className="font-retro text-lg text-deep/85">
              Simulating Razorpay UPI / NetBanking / Card test authorization.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setSimulatedCheckoutOpen(false)}
            >
              Cancel Payment
            </PixelButton>
            <PixelButton
              variant="primary"
              size="md"
              onClick={handleSimulatedSuccess}
            >
              AUTHORIZE TEST PAYMENT ✓
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </>
  );
}
