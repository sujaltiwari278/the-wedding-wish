import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import Link from "next/link";

export const metadata = {
  title: "Features | The Wedding Wish",
  description: "Explore the full suite of retro pixel-art registry features and AI helpers.",
};

export default function FeaturesPage() {
  const featureList = [
    {
      title: "16-BIT RETRO PIXEL ENGINE",
      badge: "RETRO ART",
      desc: "Inspired by classic NES/SNES game carts. Custom hand-drawn pixel sprites, stepped animations, and authentic 8-bit chiptune sound chimes.",
      icon: "👾",
    },
    {
      title: "AI GOAL ASSISTANT",
      badge: "GEMINI AI",
      desc: "Stuck on registry ideas? Our AI analyzes your interests, travel dreams, and overall budget to generate personalized wedding goal suggestions.",
      icon: "🤖",
    },
    {
      title: "AI WHATSAPP THANK-YOUS",
      badge: "ONE-TAP",
      desc: "Generate culturally aware, warm, and heartfelt thank-you notes tailored to each guest's name, goal, and wish. Send directly via WhatsApp.",
      icon: "💬",
    },
    {
      title: "RAZORPAY IDEMPOTENT SHAGUN",
      badge: "PAYMENTS",
      desc: "Full support for UPI, Google Pay, PhonePe, Cards, and Netbanking. Atomic ledger status updates and cryptographic signature verification.",
      icon: "💳",
    },
    {
      title: "SMS OTP GUEST AUTH",
      badge: "SECURITY",
      desc: "Zero passwords. Guests verify with a 6-digit SMS OTP, ensuring verified attendees without tedious account signups.",
      icon: "📱",
    },
    {
      title: "SMART QR & 8-CHAR CODES",
      badge: "SHARING",
      desc: "Download retro-bordered wedding QR codes or copy your unambiguous 8-letter wedding code for physical and digital wedding invitations.",
      icon: "🔲",
    },
    {
      title: "INTERACTIVE WISHES WALL",
      badge: "COMMUNITY",
      desc: "Guests leave heartfelt messages of congratulations. Couples can star their favorite blessings and display a curated public blessing strip.",
      icon: "💌",
    },
    {
      title: "ENTERPRISE PII SHIELD",
      badge: "PRIVACY",
      desc: "Guest phone numbers and private details are strictly shielded from public view and visible exclusively to the verified couple.",
      icon: "🛡",
    },
    {
      title: "REAL-TIME DASHBOARD & CHARTS",
      badge: "ANALYTICS",
      desc: "Couples get real-time metrics, goal breakdown bar charts, contributor lists, and instant CSV-ready shagun records.",
      icon: "📊",
    },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-3 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            POWERED BY RETRO TECH &amp; MODERN AI
          </div>
          <h1 className="font-pixel text-3xl md:text-5xl text-deep leading-tight">
            FEATURE SHOWCASE
          </h1>
          <p className="font-retro text-2xl md:text-3xl text-vintage max-w-2xl mx-auto">
            Everything you need for an unforgettable, modern Indian wedding registry.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feat, idx) => (
            <PixelCard
              key={idx}
              variant="default"
              className="border-4 border-deep p-6 space-y-3 bg-cream hover:bg-soft-blush transition-colors shadow-pixel"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{feat.icon}</span>
                <span className="font-pixel text-[9px] bg-vintage text-cream px-2 py-0.5 border border-deep">
                  {feat.badge}
                </span>
              </div>
              <h3 className="font-pixel text-xs sm:text-sm text-deep">
                {feat.title}
              </h3>
              <p className="font-retro text-xl text-vintage leading-relaxed">
                {feat.desc}
              </p>
            </PixelCard>
          ))}
        </div>

        {/* Banner CTA */}
        <div className="border-4 border-deep bg-soft-blush p-8 text-center space-y-4">
          <h2 className="font-pixel text-2xl text-deep">
            START YOUR WEDDING WISH TODAY
          </h2>
          <p className="font-retro text-2xl text-vintage">
            No upfront fees, no complex setup. Create your registry in under 2 minutes.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <PixelButton variant="primary" size="lg">
                Create Free Registry →
              </PixelButton>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
