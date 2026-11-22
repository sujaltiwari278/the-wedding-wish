import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import Wish from "@/models/Wish";
import "@/models/Guest";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { WeddingCountdown } from "@/components/couple/WeddingCountdown";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { QuickShareStrip } from "@/components/dashboard/QuickShareStrip";
import { GoalBreakdownChart } from "@/components/dashboard/GoalBreakdownChart";
import { CelebrationBanner } from "@/components/dashboard/CelebrationBanner";
import { ContributionsTable, ContributionRow } from "@/components/dashboard/ContributionsTable";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { PixelEmptyState } from "@/components/ui/PixelEmptyState";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelBackButton } from "@/components/ui/PixelBackButton";
import { PixelIcon } from "@/components/icons/PixelIcons";
import { formatIndianRupees, calculateProgressPercentage, paiseToRupees } from "@/lib/money";

export const metadata = {
  title: "Couple Dashboard | The Wedding Wish",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await connectToDatabase();
  const coupleId = new mongoose.Types.ObjectId(session.user.id);

  const couple = await Couple.findById(coupleId).lean();
  if (!couple) {
    redirect("/login");
  }

  // 1. Fetch Goals
  const goals = await Goal.find({ coupleId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const activeGoals = goals.filter((g) => g.status === "active");

  // 2. Aggregate verified contributions
  const contributionAgg = await Contribution.aggregate([
    {
      $match: {
        coupleId,
        paymentStatus: "successful",
      },
    },
    {
      $group: {
        _id: null,
        totalCollected: { $sum: "$amount" },
        count: { $sum: 1 },
        uniqueGuests: { $addToSet: "$guestId" },
      },
    },
  ]);

  const totalCollectedPaise = contributionAgg[0]?.totalCollected || 0;
  const successfulContributions = contributionAgg[0]?.count || 0;
  const uniqueContributors = contributionAgg[0]?.uniqueGuests?.length || 0;

  // 3. Fetch all contributions for table (populated with Guest and Goal)
  const allContributions = await Contribution.find({ coupleId })
    .populate({ path: "guestId", select: "fullName mobileNumber relationship" })
    .populate({ path: "goalId", select: "title" })
    .sort({ createdAt: -1 })
    .lean();

  const formattedRows: ContributionRow[] = allContributions.map((c) => {
    const g = c.guestId as unknown as { fullName?: string; mobileNumber?: string; relationship?: string } | null;
    const goalItem = c.goalId as unknown as { _id?: mongoose.Types.ObjectId; title?: string } | null;

    return {
      id: c._id.toString(),
      transactionId: c.transactionId,
      amount: c.amount,
      paymentStatus: c.paymentStatus,
      paidAt: c.paidAt ? c.paidAt.toISOString() : undefined,
      createdAt: c.createdAt.toISOString(),
      guestMessage: c.guestMessage,
      thankYouSent: c.thankYouSent,
      guestName: g?.fullName || "Honoured Guest",
      guestMobile: g?.mobileNumber || "N/A",
      guestRelationship: g?.relationship || "Other",
      goalTitle: goalItem?.title || "Wedding Goal",
      goalId: goalItem?._id ? goalItem._id.toString() : "",
    };
  });

  // 4. Fetch Wishes with guest names
  const wishes = await Wish.find({ coupleId })
    .populate({ path: "guestId", select: "fullName relationship" })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // 5. Chart data
  const chartData = goals.map((g) => ({
    title: g.title,
    collectedRupees: paiseToRupees(g.collectedAmount || 0),
    targetRupees: paiseToRupees(g.targetAmount),
  }));

  // 6. Check celebration milestone goals
  const justCompletedGoalIds = couple.justCompletedGoalIds || [];
  const justCompletedTitles = goals
    .filter((g) => justCompletedGoalIds.includes(g._id.toString()))
    .map((g) => g.title);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/" label="← HOME" />
        </div>

        {/* Celebration Milestone Banner */}
        {justCompletedTitles.length > 0 && (
          <CelebrationBanner completedGoalTitles={justCompletedTitles} />
        )}
        {/* Realm Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
              SANCTUARY LEVEL 2
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel text-deep">
              {couple.partnerOneName} & {couple.partnerTwoName}&apos;S WEDDING REALM
            </h1>
            <p className="font-retro text-2xl text-deep/80">
              Track shagun blessings, verify contributions, and watch your dreams unlock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/goals">
              <PixelButton variant="primary" size="md">
                MANAGE DREAMS 
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Wedding Countdown */}
        <WeddingCountdown weddingDate={couple.weddingDate} />

        {/* Quick Share Strip */}
        <QuickShareStrip
          weddingCode={couple.weddingCode}
          profileSlug={couple.profileSlug}
        />

        {/* 4 Metric Cards */}
        <MetricCards
          totalCollectedPaise={totalCollectedPaise}
          successfulContributions={successfulContributions}
          uniqueContributors={uniqueContributors}
          activeGoalsCount={activeGoals.length}
        />

        {/* Chart + Active Goals Progress Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recharts Breakdown */}
          <PixelCard variant="default" shadow="md">
            <PixelCardHeader>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>DREAMS FUNDING PROGRESSION</span>
              </div>
            </PixelCardHeader>
            <PixelCardContent>
              <GoalBreakdownChart data={chartData} />
            </PixelCardContent>
          </PixelCard>

          {/* Active Goals List */}
          <PixelCard variant="cream" shadow="md">
            <PixelCardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>ACTIVE DREAMS LIST</span>
                </div>
                <Link
                  href="/goals"
                  className="font-pixel text-[10px] text-vintage hover:underline"
                >
                  ALL DREAMS →
                </Link>
              </div>
            </PixelCardHeader>

            <PixelCardContent>
              {activeGoals.length === 0 ? (
                <PixelEmptyState
                  title="No Active Dreams"
                  description="Add your honeymoon or first home dreams so guests can send shagun."
                />
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const progress = calculateProgressPercentage(
                      goal.collectedAmount || 0,
                      goal.targetAmount
                    );

                    return (
                      <div
                        key={goal._id.toString()}
                        className="bg-soft-blush border-2 border-deep p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PixelIcon name={goal.image || "heart"} size={16} />
                            <span className="font-pixel text-xs text-deep">
                              {goal.title}
                            </span>
                          </div>
                          <span className="font-pixel text-[10px] text-vintage font-bold">
                            {formatIndianRupees(goal.collectedAmount || 0)} /{" "}
                            {formatIndianRupees(goal.targetAmount)}
                          </span>
                        </div>
                        <PixelProgressBar progress={progress} segments={10} size="sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Contributions Table (Couple-only, with Guest Mobile Numbers) */}
        <PixelCard variant="default" shadow="md">
          <PixelCardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>SHAGUN CONTRIBUTIONS & AUDIT LEDGER</span>
              </div>
              <span className="font-retro text-base text-deep/70 hidden sm:inline">
                Guest mobile numbers confidential to you
              </span>
            </div>
          </PixelCardHeader>

          <PixelCardContent>
            <ContributionsTable
              contributions={formattedRows}
              goals={goals.map((g) => ({
                id: g._id.toString(),
                title: g.title,
              }))}
            />
          </PixelCardContent>
        </PixelCard>

        {/* Guest Blessings & Wishes */}
        <PixelCard variant="cream" shadow="md">
          <PixelCardHeader>
            <div className="flex items-center gap-2">
              <span>💌</span>
              <span>GUEST BLESSINGS & WISHES REGISTRY</span>
            </div>
          </PixelCardHeader>
          <PixelCardContent>
            {wishes.length === 0 ? (
              <PixelEmptyState
                title="Wish Registry Empty"
                description="Heartfelt messages sent along with shagun envelopes will be preserved right here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishes.map((w) => {
                  const g = w.guestId as unknown as { fullName?: string; relationship?: string } | null;

                  return (
                    <div
                      key={w._id.toString()}
                      className="p-4 border-2 border-deep bg-soft-blush space-y-2 shadow-pixel-sm"
                    >
                      <div className="flex justify-between items-baseline border-b border-deep/15 pb-1">
                        <span className="font-pixel text-xs text-vintage">
                          {g?.fullName || "Honoured Guest"}
                        </span>
                        <span className="font-retro text-sm text-deep/60">
                          {new Date(w.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="font-retro text-lg italic text-deep">
                        &ldquo;{w.message}&rdquo;
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
