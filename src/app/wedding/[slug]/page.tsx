import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import Wish from "@/models/Wish";
import Guest from "@/models/Guest";
import { WeddingCountdown } from "@/components/couple/WeddingCountdown";
import { PublicGoalCard } from "@/components/public/PublicGoalCard";
import { PublicWishesStrip } from "@/components/public/PublicWishesStrip";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await connectToDatabase();
  const couple = await Couple.findOne({
    profileSlug: params.slug.toLowerCase().trim(),
  })
    .select("partnerOneName partnerTwoName weddingDescription")
    .lean();

  if (!couple) {
    return {
      title: "Wedding Wish Not Found",
    };
  }

  return {
    title: `${couple.partnerOneName} & ${couple.partnerTwoName}'s Wedding Registry | The Wedding Wish`,
    description:
      couple.weddingDescription ||
      "Traditional shagun, reimagined. Bless our new journey together.",
  };
}

export default async function PublicWeddingPage({ params }: PageProps) {
  await connectToDatabase();

  const couple = await Couple.findOne({
    profileSlug: params.slug.toLowerCase().trim(),
  }).lean();

  if (!couple) {
    notFound();
  }

  // 1. Fetch only active/completed public goals (sort spotlight goals first)
  const goals = await Goal.find({
    coupleId: couple._id,
    status: { $in: ["active", "completed"] },
  })
    .sort({ isSpotlight: -1, order: 1, createdAt: 1 })
    .lean();

  // 2. Fetch successful contributions to calculate contributor counts & recent supporters
  const goalIds = goals.map((g) => g._id);
  const successfulContributions = await Contribution.find({
    goalId: { $in: goalIds },
    paymentStatus: "successful",
  })
    .populate({ path: "guestId", select: "fullName" })
    .sort({ paidAt: -1, createdAt: -1 })
    .lean();

  const goalContributorMap = new Map<string, { count: number; recentSupporters: string[] }>();

  successfulContributions.forEach((c) => {
    const gid = c.goalId.toString();
    const g = c.guestId as unknown as { fullName?: string } | null;
    const rawName = g?.fullName?.trim() || "";
    // Only display first name publicly
    const firstName = rawName.split(" ")[0] || "Well-Wisher";

    if (!goalContributorMap.has(gid)) {
      goalContributorMap.set(gid, { count: 1, recentSupporters: [firstName] });
    } else {
      const entry = goalContributorMap.get(gid)!;
      entry.count += 1;
      if (entry.recentSupporters.length < 3 && !entry.recentSupporters.includes(firstName)) {
        entry.recentSupporters.push(firstName);
      }
    }
  });

  const enrichedGoals = goals.map((goal) => {
    const stats = goalContributorMap.get(goal._id.toString());
    return {
      ...goal,
      contributorCount: stats?.count || 0,
      recentSupporters: stats?.recentSupporters || [],
    };
  });

  // 3. Fetch public wishes if showWishesPublicly is true (strictly first name + message only)
  let publicWishes: { id: string; firstName: string; message: string; createdAt: string }[] = [];
  if (couple.showWishesPublicly !== false) {
    const wishesDocs = await Wish.find({ coupleId: couple._id })
      .populate({ path: "guestId", select: "fullName" })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    publicWishes = wishesDocs.map((w) => {
      const g = w.guestId as unknown as { fullName?: string } | null;
      const rawName = g?.fullName?.trim() || "";
      const firstName = rawName.split(" ")[0] || "Well-Wisher";

      return {
        id: w._id.toString(),
        firstName,
        message: w.message,
        createdAt: w.createdAt.toISOString(),
      };
    });
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Banner Navigation */}
      <header className="bg-soft-blush border-b-4 border-deep px-4 py-3 sticky top-0 z-30 shadow-pixel-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <span className="font-pixel text-xs text-deep font-bold tracking-wider">
              THE WEDDING WISH
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-pixel text-[10px] text-vintage">
              CODE: {couple.weddingCode}
            </span>
            <Link href={`/guest?code=${couple.weddingCode}`}>
              <PixelButton size="sm" variant="primary">
                GIVE SHAGUN 🎁
              </PixelButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Couple Hero Presentation */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-4 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            WEDDING REGISTRY REALM
          </div>
          <h1 className="text-3xl md:text-5xl font-pixel text-deep leading-tight">
            {couple.partnerOneName} & {couple.partnerTwoName}
          </h1>

          {/* Intro Description */}
          {couple.weddingDescription && (
            <p className="max-w-2xl mx-auto font-retro text-2xl md:text-3xl text-vintage leading-snug">
              &ldquo;{couple.weddingDescription}&rdquo;
            </p>
          )}
        </div>

        {/* Reusable Countdown */}
        <WeddingCountdown weddingDate={couple.weddingDate} />

        {/* Couple Story (If provided) */}
        {couple.coupleStory && (
          <PixelCard variant="cream" shadow="md" className="space-y-2">
            <h2 className="font-pixel text-xs text-vintage uppercase tracking-wider mb-2">
              OUR JOURNEY TOGETHER
            </h2>
            <p className="font-retro text-xl text-deep/90 leading-relaxed whitespace-pre-line">
              {couple.coupleStory}
            </p>
          </PixelCard>
        )}

        {/* Goals Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b-2 border-deep/20 pb-3">
            <div>
              <span className="font-pixel text-[10px] text-vintage uppercase tracking-wider block">
                OUR WISH LIST
              </span>
              <h2 className="font-pixel text-xl text-deep">
                DREAMS WE ARE BUILDING TOGETHER
              </h2>
            </div>
            <p className="font-retro text-lg text-deep/70">
              Pick any goal to bless with your shagun envelope.
            </p>
          </div>

          {enrichedGoals.length === 0 ? (
            <PixelCard variant="default" className="text-center py-12">
              <span className="text-4xl block mb-2">🌸</span>
              <h3 className="font-pixel text-xs text-deep uppercase mb-1">
                The Couple Is Still Preparing Their Wishlist
              </h3>
              <p className="font-retro text-xl text-deep/75">
                Check back soon to see their dreams and contribute your blessings.
              </p>
            </PixelCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrichedGoals.map((goal) => (
                <PublicGoalCard
                  key={goal._id.toString()}
                  goal={goal}
                  weddingCode={couple.weddingCode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Public Wishes Feed (Controlled by Couple's showWishesPublicly setting) */}
        {couple.showWishesPublicly !== false && publicWishes.length > 0 && (
          <PublicWishesStrip wishes={publicWishes} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-deep bg-soft-blush py-6 text-center text-deep">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-pixel text-[10px] text-vintage">
            THE WEDDING WISH • TRADITIONAL SHAGUN, REIMAGINED
          </p>
          <p className="font-retro text-base text-deep/70">
            A retro 2D pixel-art wedding registry realm.
          </p>
        </div>
      </footer>
    </div>
  );
}
