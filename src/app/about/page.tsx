import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { Sprite } from "@/components/animations/Sprite";
import Link from "next/link";

export const metadata = {
  title: "About Us | The Wedding Wish",
  description: "A Little Shagun. A Lifetime of Dreams. Learn how we are modernising Indian wedding gifting.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-3 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            OUR STORY &amp; PHILOSOPHY
          </div>
          <h1 className="font-pixel text-3xl md:text-5xl text-deep leading-tight">
            TRADITIONAL SHAGUN, REIMAGINED
          </h1>
          <p className="font-retro text-2xl md:text-3xl text-vintage">
            &ldquo;A Little Shagun. A Lifetime of Dreams.&rdquo;
          </p>
        </div>

        {/* Character Illustration Banner */}
        <div className="p-6 border-4 border-deep bg-soft-blush shadow-pixel flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="flex items-center gap-4">
            <Sprite
              src="/sprites/groom-idle.svg"
              frameWidth={32}
              frameHeight={48}
              frameCount={4}
              fps={4}
              scale={2}
              alt="Pixel Groom"
            />
            <Sprite
              src="/sprites/bride-idle.svg"
              frameWidth={32}
              frameHeight={48}
              frameCount={4}
              fps={4}
              scale={2}
              alt="Pixel Bride"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-pixel text-xs text-deep">PLAYER 1 &amp; PLAYER 2</div>
            <div className="font-retro text-2xl text-vintage">
              Embarking on life&apos;s greatest co-op adventure together.
            </div>
          </div>
        </div>

        {/* Narrative Section 1: The Cultural Legacy of Shagun */}
        <PixelCard variant="default" className="border-4 border-deep p-6 md:p-8 space-y-4">
          <h2 className="font-pixel text-xl text-deep border-b-2 border-deep pb-2">
            THE SACRED TRADITION OF SHAGUN
          </h2>
          <div className="font-retro text-2xl text-vintage leading-relaxed space-y-4">
            <p>
              In Indian wedding heritage, a gift has never just been an item. It is <em>shagun</em>:
              an auspicious token of pure blessings, love, and goodwill. Traditionally handed over in an
              embroidered envelope (<em>lifafa</em>) adorned with a single one-rupee coin for unbroken prosperity,
              shagun is meant to set the newlyweds on a fertile, joyous journey.
            </p>
            <p>
              Yet in our modern celebrations, this sacred gesture often faces friction. Chaotic banquet halls
              lead to misplaced envelopes. Couples end up with five identical mixer-grinders, twelve dinner sets,
              and bulky household items they have no space for. Meanwhile, guests are left wondering whether their
              gift is genuinely useful.
            </p>
          </div>
        </PixelCard>

        {/* Narrative Section 2: Collective Dreams */}
        <PixelCard variant="elevated" className="border-4 border-deep p-6 md:p-8 space-y-4 bg-soft-blush">
          <h2 className="font-pixel text-xl text-deep border-b-2 border-deep pb-2">
            TURNING BLESSINGS INTO REAL MILESTONES
          </h2>
          <div className="font-retro text-2xl text-deep leading-relaxed space-y-4">
            <p>
              Today&apos;s couples have distinct aspirations: embarking on a lifetime honeymoon in Europe,
              gathering a downpayment for their first family home, styling a custom kitchen, or outfitting
              a welcoming living room.
            </p>
            <p>
              <strong>The Wedding Wish</strong> bridges tradition and tomorrow. Instead of arbitrary items,
              guests pool their shagun towards specific, tangible goals. Every ₹501, ₹1,001 or ₹5,001 directly
              advances a milestone. Guests receive instant receipts and leave heartfelt wishes; couples watch their
              dreams fill up with love.
            </p>
          </div>
        </PixelCard>

        {/* Narrative Section 3: The Retro Aesthetic */}
        <PixelCard variant="cream" className="border-4 border-deep p-6 md:p-8 space-y-4">
          <h2 className="font-pixel text-xl text-deep border-b-2 border-deep pb-2">
            WHY 16-BIT RETRO PIXEL ART?
          </h2>
          <div className="font-retro text-2xl text-vintage leading-relaxed space-y-4">
            <p>
              Because marriage is the ultimate 2-player co-op video game! Building a life together is about
              clearing stages, leveling up, conquering challenges, and unlocking achievements with your chosen partner.
            </p>
            <p>
              We designed The Wedding Wish with authentic NES/SNES pixel charm, nostalgic 8-bit sound chimes,
              and tactile stepped shadows to bring playfulness and pure warmth back to wedding registries.
            </p>
          </div>
        </PixelCard>

        {/* CTA */}
        <div className="text-center pt-6 space-y-4">
          <Link href="/register">
            <PixelButton variant="primary" size="lg">
              Begin Your Wedding Journey →
            </PixelButton>
          </Link>
          <div className="font-retro text-xl text-vintage">
            Free forever for couples. Zero hidden surprise fees.
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
