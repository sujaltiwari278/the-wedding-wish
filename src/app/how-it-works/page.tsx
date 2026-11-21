import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import Link from "next/link";

export const metadata = {
  title: "How It Works | The Wedding Wish",
  description: "Learn how couples set up registries and how guests send shagun in 4 simple steps.",
};

export default function HowItWorksPage() {
  const coupleSteps = [
    {
      num: "01",
      title: "CREATE REGISTRY & DREAMS",
      desc: "Sign up in 60 seconds. Use our AI Goal Assistant or write your own dreams: honeymoon, home downpayment, kitchen gadgets, or furniture.",
      emoji: "📝",
    },
    {
      num: "02",
      title: "SHARE CODE & RETRO QR",
      desc: "Get an 8-character Wedding Code and printable pixel QR code. Drop them into your printed invitations, digital invites, or WhatsApp groups.",
      emoji: "💌",
    },
    {
      num: "03",
      title: "WATCH DREAMS LEVEL UP",
      desc: "Receive instant notifications as guests contribute. Track your shagun progress bars, read personal wishes, and see who gave what.",
      emoji: "🎮",
    },
    {
      num: "04",
      title: "SEND 1-TAP THANK-YOUS",
      desc: "Our AI generates warm, culturally aware thank-you notes customized to each guest, goal, and wish. Send directly via WhatsApp.",
      emoji: "💬",
    },
  ];

  const guestSteps = [
    {
      num: "01",
      title: "ENTER CODE OR SCAN QR",
      desc: "Arrive at the couple's private profile by scanning their wedding QR or entering their 8-letter code. No app download needed.",
      emoji: "🔍",
    },
    {
      num: "02",
      title: "INSTANT SMS OTP",
      desc: "Verify your Indian mobile number (+91) with a 6-digit OTP. Safe, swift, and no passwords to remember.",
      emoji: "📱",
    },
    {
      num: "03",
      title: "PICK GOAL & CHOOSE AMOUNT",
      desc: "Browse the couple's wishlist. Pick auspicious presets like ₹501, ₹1,001, ₹2,001, ₹5,001 or type any custom shagun amount.",
      emoji: "💰",
    },
    {
      num: "04",
      title: "PAY & BESTOW BLESSINGS",
      desc: "Pay securely via Razorpay (UPI, cards, netbanking). Add a personal message to their public Wishes Wall and print your official receipt.",
      emoji: "✨",
    },
  ];

  const faqs = [
    {
      q: "Is payment safe and secure?",
      a: "Yes! All transactions are processed via Razorpay, India's leading RBI-compliant payment gateway. Your payment details are strictly encrypted.",
    },
    {
      q: "Can a guest contribute to multiple goals?",
      a: "Absolutely. With a single mobile OTP session, guests can contribute to multiple goals (e.g. ₹1,001 towards the Honeymoon and ₹501 towards the Dream Kitchen).",
    },
    {
      q: "Who can see the guest's mobile number?",
      a: "Privacy is strictly protected. Guest mobile numbers are visible ONLY to the verified owning couple on their private dashboard, never to public visitors.",
    },
    {
      q: "What happens if a goal reaches 100%?",
      a: "The goal is marked as Achieved with a celebratory animation! Guests can continue contributing if the couple allows, or pick other active dreams.",
    },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-3 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            STEP-BY-STEP GUIDE
          </div>
          <h1 className="font-pixel text-3xl md:text-5xl text-deep leading-tight">
            HOW THE WEDDING WISH WORKS
          </h1>
          <p className="font-retro text-2xl md:text-3xl text-vintage">
            Designed for seamless celebration between couples and their guests.
          </p>
        </div>

        {/* FOR COUPLES SECTION */}
        <section className="space-y-6">
          <div className="border-b-4 border-deep pb-2 flex items-center justify-between">
            <h2 className="font-pixel text-xl sm:text-2xl text-deep">
              👑 FOR THE COUPLE
            </h2>
            <span className="font-pixel text-[10px] bg-vintage text-cream px-2 py-1">
              HOST PLAYERS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupleSteps.map((step) => (
              <PixelCard
                key={step.num}
                variant="default"
                className="border-4 border-deep p-6 space-y-3 bg-soft-blush"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-sm bg-deep text-cream px-2.5 py-1">
                    STEP {step.num}
                  </span>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="font-pixel text-sm text-deep">{step.title}</h3>
                <p className="font-retro text-xl text-vintage leading-relaxed">
                  {step.desc}
                </p>
              </PixelCard>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/register">
              <PixelButton variant="primary" size="md">
                Create Couple Registry →
              </PixelButton>
            </Link>
          </div>
        </section>

        {/* FOR GUESTS SECTION */}
        <section className="space-y-6">
          <div className="border-b-4 border-deep pb-2 flex items-center justify-between">
            <h2 className="font-pixel text-xl sm:text-2xl text-deep">
              🎁 FOR WEDDING GUESTS
            </h2>
            <span className="font-pixel text-[10px] bg-vintage text-cream px-2 py-1">
              GUEST PLAYERS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guestSteps.map((step) => (
              <PixelCard
                key={step.num}
                variant="cream"
                className="border-4 border-deep p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-sm bg-vintage text-cream px-2.5 py-1">
                    STEP {step.num}
                  </span>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="font-pixel text-sm text-deep">{step.title}</h3>
                <p className="font-retro text-xl text-vintage leading-relaxed">
                  {step.desc}
                </p>
              </PixelCard>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/guest">
              <PixelButton variant="secondary" size="md">
                Enter Wedding Code as Guest →
              </PixelButton>
            </Link>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-6">
          <div className="border-b-4 border-deep pb-2">
            <h2 className="font-pixel text-xl sm:text-2xl text-deep">
              ❓ FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <PixelCard
                key={idx}
                variant="outline"
                className="border-2 border-deep p-5 space-y-2 bg-cream"
              >
                <h3 className="font-pixel text-xs sm:text-sm text-deep flex items-center gap-2">
                  <span className="text-vintage">Q:</span> {faq.q}
                </h3>
                <p className="font-retro text-xl text-vintage leading-relaxed pl-4">
                  {faq.a}
                </p>
              </PixelCard>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
