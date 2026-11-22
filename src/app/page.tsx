import { Suspense } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { Sprite } from "@/components/animations/Sprite";
import { PixelHearts } from "@/components/animations/PixelHearts";
import { LandingCodeInput } from "@/components/public/LandingCodeInput";
import { LoggedOutToast } from "@/components/public/LoggedOutToast";

export default function Home() {
  const exampleGoals = [
    {
      title: "Europe Honeymoon",
      category: "travel",
      collectedPaise: 11250000,
      targetPaise: 15000000,
      emoji: "✈",
    },
    {
      title: "Our First Home Downpayment",
      category: "home",
      collectedPaise: 6500000,
      targetPaise: 10000000,
      emoji: "🏡",
    },
    {
      title: "Dream Kitchen & Coffee Nook",
      category: "appliances",
      collectedPaise: 4000000,
      targetPaise: 4000000,
      emoji: "☕",
    },
    {
      title: "Living Room Furniture",
      category: "decor",
      collectedPaise: 2800000,
      targetPaise: 5000000,
      emoji: "🛋",
    },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col selection:bg-rose-dusty selection:text-deep">
      <PublicNavbar />

      {/* Logout Toast Notification */}
      <Suspense fallback={null}>
        <LoggedOutToast />
      </Suspense>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b-4 border-deep py-8 sm:py-12 md:py-16 3xl:py-24 px-3 sm:px-6 lg:px-8">
        {/* Floating Pixel Hearts Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-80">
          <PixelHearts count={18} />
        </div>

        <div className="max-w-5xl 3xl:max-w-7xl mx-auto relative z-10 text-center space-y-6 sm:space-y-8">
          {/* Retro Auspicious Badge */}
          <div className="inline-flex items-center gap-2 bg-soft-blush border-2 border-deep px-3 sm:px-4 py-1.5 shadow-pixel-sm max-w-[95vw]">
            <span className="text-xs sm:text-sm">🌸</span>
            <span className="font-pixel text-[9px] sm:text-[11px] 3xl:text-xs text-deep uppercase tracking-wider truncate">
              A Little Shagun. A Lifetime of Dreams.
            </span>
            <span className="text-xs sm:text-sm">🌸</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2 sm:space-y-4">
            <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl text-deep leading-tight tracking-wide drop-shadow-sm break-words">
              THE WEDDING WISH
            </h1>
          </div>

          {/* Animated Retro Couple Characters */}
          <div className="py-2 flex items-center justify-center gap-4 sm:gap-8 md:gap-10">
            {/* Groom */}
            <div className="flex flex-col items-center">
              <div className="p-1.5 sm:p-2 border-2 border-deep bg-soft-blush shadow-pixel-sm">
                <Sprite
                  src="/sprites/groom-idle.svg"
                  frameWidth={32}
                  frameHeight={48}
                  frameCount={4}
                  fps={4}
                  scale={1.75}
                  alt="Retro Groom Sprite"
                />
              </div>
              <span className="font-pixel text-[9px] sm:text-[10px] text-deep mt-1 sm:mt-2 bg-cream px-1.5 sm:px-2 py-0.5 border border-deep">
                GROOM
              </span>
            </div>

            {/* Central Auspicious Garland & Heart */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <div className="text-xl sm:text-2xl animate-bounce">💌</div>
            </div>

            {/* Bride */}
            <div className="flex flex-col items-center">
              <div className="p-1.5 sm:p-2 border-2 border-deep bg-soft-blush shadow-pixel-sm">
                <Sprite
                  src="/sprites/bride-idle.svg"
                  frameWidth={32}
                  frameHeight={48}
                  frameCount={4}
                  fps={4}
                  scale={1.75}
                  alt="Retro Bride Sprite"
                />
              </div>
              <span className="font-pixel text-[9px] sm:text-[10px] text-deep mt-1 sm:mt-2 bg-cream px-1.5 sm:px-2 py-0.5 border border-deep">
                BRIDE
              </span>
            </div>
          </div>

          {/* TWO CLEARLY SEPARATED CHOICES (COUPLE vs GUEST) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4 text-left">
            {/* CHOICE 1: I'M A COUPLE */}
            <PixelCard
              variant="cream"
              className="border-4 border-deep p-5 sm:p-6 space-y-4 shadow-pixel-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b-2 border-deep/20 pb-2">
                  <span className="font-pixel text-xs sm:text-sm text-deep flex items-center gap-2">
                    <span>👑</span> I&apos;M A COUPLE
                  </span>
                  <span className="font-pixel text-[9px] bg-soft-blush text-deep px-2 py-0.5 border border-deep">
                    HOST
                  </span>
                </div>
                <p className="font-retro text-xl sm:text-2xl text-vintage leading-normal">
                  Create your wedding profile, add dream goals, download your QR code, and send AI thank-you notes.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link href="/login" className="flex-1">
                  <PixelButton variant="primary" size="md" className="w-full text-center">
                    Couple Login →
                  </PixelButton>
                </Link>
                <Link href="/register" className="flex-1">
                  <PixelButton variant="secondary" size="md" className="w-full text-center">
                    Register Free 
                  </PixelButton>
                </Link>
              </div>
            </PixelCard>

            {/* CHOICE 2: I'M A GUEST */}
            <PixelCard
              variant="default"
              className="border-4 border-deep p-5 sm:p-6 space-y-4 shadow-pixel-lg bg-soft-blush flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b-2 border-deep/20 pb-2">
                  <span className="font-pixel text-xs sm:text-sm text-deep flex items-center gap-2">
                    <span>🎁</span> I&apos;M A GUEST
                  </span>
                  <span className="font-pixel text-[9px] bg-vintage text-cream px-2 py-0.5 border border-deep">
                    BLESSINGS
                  </span>
                </div>
                <p className="font-retro text-xl sm:text-2xl text-deep leading-normal">
                  Enter your wedding code or mobile OTP to browse wishlist dreams and bestow shagun blessings.
                </p>
              </div>

              <div className="space-y-3 pt-1">
  <LandingCodeInput />

  <div className="flex justify-center">
    <Link href="/guest" className="w-full sm:w-auto">
      <PixelButton
        variant="ghost"
        size="sm"
        className="w-full text-center bg-cream whitespace-nowrap"
      >
        Guest Login (OTP)
      </PixelButton>
    </Link>
  </div>
</div>
            </PixelCard>
          </div>
        </div>
      </section>

      {/* THE PROBLEM & THE SOLUTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl 3xl:max-w-7xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-block bg-vintage text-cream font-pixel text-[9px] sm:text-[10px] px-3 py-1 uppercase border-2 border-deep">
            NOSTALGIC WEDDING VIDEO GAME
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-deep">
            WHY THE WEDDING WISH?
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-vintage max-w-2xl mx-auto">
            Turning traditional gifting awkwardness into joyful milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Traditional Way */}
          <PixelCard variant="outline" className="border-4 border-deep p-5 sm:p-6 space-y-4 bg-blush/30">
            <div className="flex items-center gap-3 border-b-2 border-deep pb-2">
              <span className="text-2xl">📦</span>
              <h3 className="font-pixel text-xs sm:text-sm text-deep">THE TRADITIONAL DILEMMA</h3>
            </div>
            <ul className="space-y-3 font-retro text-lg sm:text-xl text-vintage">
              <li className="flex items-start gap-2">
                <span className="text-deep font-bold">✕</span>
                <span>
                  <strong>Repetitive Gifts:</strong> Couples receive 5 mixer-grinders, 8 dinner sets, and duplicate irons.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep font-bold">✕</span>
                <span>
                  <strong>Lost Cash Envelopes:</strong> Cash lifafas get misplaced during chaotic receptions without records.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep font-bold">✕</span>
                <span>
                  <strong>Guilt &amp; Guesswork:</strong> Guests wonder how much is polite or if their present will gather dust in a closet.
                </span>
              </li>
            </ul>
          </PixelCard>

          {/* Reimagined Way */}
          <PixelCard variant="elevated" className="border-4 border-deep p-5 sm:p-6 space-y-4 bg-cream">
            <div className="flex items-center gap-3 border-b-2 border-deep pb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-pixel text-xs sm:text-sm text-deep">THE WEDDING WISH WAY</h3>
            </div>
            <ul className="space-y-3 font-retro text-lg sm:text-xl text-deep">
              <li className="flex items-start gap-2">
                <span className="text-vintage font-bold">✔</span>
                <span>
                  <strong>Fund Real Dreams:</strong> Honeymoon in Europe, first home downpayment, dream kitchen, furniture.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vintage font-bold">✔</span>
                <span>
                  <strong>Instant OTP &amp; Razorpay:</strong> Fast mobile verification, transparent receipts, 100% secure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vintage font-bold">✔</span>
                <span>
                  <strong>Heartfelt AI Thank-Yous:</strong> Couples send personal WhatsApp messages with one click.
                </span>
              </li>
            </ul>
          </PixelCard>
        </div>
      </section>

      {/* SAMPLE DREAM REGISTRY PREVIEW */}
      <section className="bg-soft-blush border-y-4 border-deep py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl 3xl:max-w-7xl mx-auto space-y-8 sm:space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[9px] sm:text-[10px] px-3 py-1 uppercase border-2 border-deep">
              LEVEL UP YOUR WEDDING GOALS
            </div>
            <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-deep">
              SAMPLE DREAM REGISTRY
            </h2>
            <p className="font-retro text-xl sm:text-2xl text-vintage">
              Every ₹501, ₹1,001 or custom shagun unlocks real milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {exampleGoals.map((goal, idx) => {
              const pct = Math.min(
                100,
                Math.round((goal.collectedPaise / goal.targetPaise) * 100)
              );
              return (
                <PixelCard
                  key={idx}
                  variant="cream"
                  className="border-4 border-deep p-4 sm:p-5 space-y-3 shadow-pixel"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl sm:text-2xl shrink-0">{goal.emoji}</span>
                      <h4 className="font-pixel text-[11px] sm:text-xs md:text-sm text-deep truncate">
                        {goal.title}
                      </h4>
                    </div>
                    <span className="font-pixel text-[10px] bg-vintage text-cream px-2 py-0.5 border border-deep shrink-0">
                      {pct}%
                    </span>
                  </div>

                  <PixelProgressBar
                    progress={pct}
                    variant={pct >= 100 ? "deep" : "dusty"}
                    size="md"
                  />

                  <div className="flex flex-wrap justify-between font-retro text-base sm:text-lg text-vintage pt-1 gap-1">
                    <span>
                      Collected: ₹{(goal.collectedPaise / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-deep">
                      Target: ₹{(goal.targetPaise / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </PixelCard>
              );
            })}
          </div>

          <div className="text-center pt-2 sm:pt-4">
            <Link href="/register">
              <PixelButton variant="primary" size="md">
                Build Your Own Registry Now →
              </PixelButton>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS HIGHLIGHT */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl 3xl:max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-deep">
            HOW IT WORKS IN 4 EASY STEPS
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-vintage">
            Simple for couples, effortless for wedding guests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          <PixelCard variant="default" className="border-2 border-deep p-4 space-y-2">
            <div className="w-10 h-10 mx-auto bg-vintage text-cream font-pixel text-sm flex items-center justify-center border-2 border-deep shadow-pixel-sm">
              01
            </div>
            <h4 className="font-pixel text-xs text-deep">SET GOALS</h4>
            <p className="font-retro text-lg text-vintage">
              Couples list their dream honeymoon, house, or furniture with target budgets.
            </p>
          </PixelCard>

          <PixelCard variant="default" className="border-2 border-deep p-4 space-y-2">
            <div className="w-10 h-10 mx-auto bg-vintage text-cream font-pixel text-sm flex items-center justify-center border-2 border-deep shadow-pixel-sm">
              02
            </div>
            <h4 className="font-pixel text-xs text-deep">SHARE CODE</h4>
            <p className="font-retro text-lg text-vintage">
              Share your 8-character Wedding Code or retro QR code on invitations &amp; WhatsApp.
            </p>
          </PixelCard>

          <PixelCard variant="default" className="border-2 border-deep p-4 space-y-2">
            <div className="w-10 h-10 mx-auto bg-vintage text-cream font-pixel text-sm flex items-center justify-center border-2 border-deep shadow-pixel-sm">
              03
            </div>
            <h4 className="font-pixel text-xs text-deep">GUESTS CONTRIBUTE</h4>
            <p className="font-retro text-lg text-vintage">
              Guests verify with SMS OTP, pick a goal, pay via Razorpay &amp; write wishes.
            </p>
          </PixelCard>

          <PixelCard variant="default" className="border-2 border-deep p-4 space-y-2">
            <div className="w-10 h-10 mx-auto bg-vintage text-cream font-pixel text-sm flex items-center justify-center border-2 border-deep shadow-pixel-sm">
              04
            </div>
            <h4 className="font-pixel text-xs text-deep">CELEBRATE</h4>
            <p className="font-retro text-lg text-vintage">
              Track collected shagun, read public wishes, and send AI thank-yous.
            </p>
          </PixelCard>
        </div>
      </section>

      {/* FINAL RETRO CTA BANNER */}
      <section className="bg-deep text-cream py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-6 border-t-4 border-deep">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-pixel text-xl sm:text-2xl md:text-4xl text-cream leading-tight">
            READY TO REIMAGINE YOUR SHAGUN?
          </h2>
          <p className="font-retro text-xl sm:text-2xl md:text-3xl text-blush">
            Join modern couples creating meaningful wedding memories together.
          </p>
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <PixelButton variant="primary" size="lg" className="bg-rose-dusty text-deep hover:bg-blush w-full sm:w-auto">
                Start Your Registry Today
              </PixelButton>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <PixelButton variant="ghost" size="lg" className="border-cream text-cream hover:bg-cream/10 w-full sm:w-auto">
                Learn More
              </PixelButton>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
