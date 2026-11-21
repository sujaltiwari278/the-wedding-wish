import { redirect } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Goal from "@/models/Goal";
import Couple from "@/models/Couple";
import { getGuestSession } from "@/lib/guest-session";
import { formatIndianRupees } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelEmptyState } from "@/components/ui/PixelEmptyState";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export const metadata = {
  title: "My Shagun Blessings History | The Wedding Wish",
};

export default async function GuestHistoryPage() {
  const session = await getGuestSession();
  if (!session?.guestId) {
    redirect("/guest");
  }

  await connectToDatabase();

  const contributions = await Contribution.find({ guestId: session.guestId })
    .populate({ path: "coupleId", select: "partnerOneName partnerTwoName weddingDate profileSlug" })
    .populate({ path: "goalId", select: "title category image" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-soft-blush border-b-4 border-deep px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/guest" className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-pixel text-xs text-deep font-bold tracking-wider">
              THE WEDDING WISH
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <PixelBackButton href="/guest" label="← REGISTRY" className="text-[10px] sm:text-xs" />
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center">
          <PixelBackButton href="/guest" label="← REGISTRY" />
        </div>

        <div>
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
            CONTRIBUTOR LEDGER
          </div>
          <h1 className="text-2xl md:text-3xl font-pixel text-deep">
            MY SHAGUN BLESSINGS
          </h1>
          <p className="font-retro text-2xl text-deep/80">
            A history of all the wedding dreams and shagun envelopes you have funded.
          </p>
        </div>

        {contributions.length === 0 ? (
          <PixelEmptyState
            title="No Shagun Envelopes Sent Yet"
            description="Explore your couple's registry and send your first shagun blessings."
            action={
              <Link href="/guest">
                <PixelButton variant="primary" size="md">
                  Browse Wedding Dreams
                </PixelButton>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {contributions.map((c) => {
              const couple = c.coupleId as unknown as { partnerOneName?: string; partnerTwoName?: string } | null;
              const goal = c.goalId as unknown as { title?: string } | null;

              const statusBadgeVariant =
                c.paymentStatus === "successful"
                  ? "active"
                  : c.paymentStatus === "failed"
                  ? "archived"
                  : "neutral";

              return (
                <PixelCard
                  key={c._id.toString()}
                  variant="default"
                  shadow="sm"
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-deep/20 pb-2">
                    <div>
                      <span className="font-pixel text-[10px] text-vintage uppercase">
                        FOR: {couple?.partnerOneName} & {couple?.partnerTwoName}
                      </span>
                      <h3 className="font-pixel text-sm text-deep">
                        {goal?.title || "Wedding Goal"}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-base text-deep font-bold">
                        {formatIndianRupees(c.amount)}
                      </span>
                      <PixelBadge variant={statusBadgeVariant} size="sm">
                        {c.paymentStatus}
                      </PixelBadge>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-deep/75 font-retro text-lg">
                    <div>
                      <span>Ref: </span>
                      <span className="font-pixel text-[10px] sm:text-xs text-deep select-all break-all">
                        {c.transactionId}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {c.paymentStatus === "successful" && (
                      <Link href={`/payment/confirmation/${c.transactionId}`}>
                        <PixelButton size="sm" variant="secondary">
                          View Receipt 🧾
                        </PixelButton>
                      </Link>
                    )}
                  </div>

                  {c.guestMessage && (
                    <div className="p-2.5 bg-cream border border-deep/30 font-retro text-base italic text-deep">
                      &ldquo;{c.guestMessage}&rdquo;
                    </div>
                  )}
                </PixelCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
