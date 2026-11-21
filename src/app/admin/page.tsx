import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelBackButton } from "@/components/ui/PixelBackButton";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Guest from "@/models/Guest";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import { formatIndianRupees } from "@/lib/money";

export const metadata = {
  title: "Platform Overview | Admin Portal | The Wedding Wish",
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  // Aggregate Platform KPIs
  const [
    totalCouples,
    totalGuests,
    totalGoals,
    completedGoals,
    allContributions,
  ] = await Promise.all([
    Couple.countDocuments({}),
    Guest.countDocuments({ mobileVerified: true }),
    Goal.countDocuments({}),
    Goal.countDocuments({ status: "completed" }),
    Contribution.find({}).sort({ createdAt: -1 }).lean(),
  ]);

  let totalCollectedPaise = 0;
  let successfulTxCount = 0;
  let failedTxCount = 0;

  allContributions.forEach((c) => {
    if (c.paymentStatus === "successful") {
      totalCollectedPaise += c.amount || 0;
      successfulTxCount++;
    } else if (c.paymentStatus === "failed") {
      failedTxCount++;
    }
  });

  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Recent 5 couples
  const recentCouples = await Couple.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentTransactions = allContributions.slice(0, 5);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AdminNavbar email={session.email} role={session.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/" label="← HOME" />
        </div>

        {/* Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-deep pb-4">
          <div>
            <div className="inline-block bg-vintage text-cream font-pixel text-[10px] px-2 py-0.5 uppercase border border-deep">
              PLATFORM CONTROL CENTER
            </div>
            <h1 className="font-pixel text-2xl sm:text-3xl text-deep mt-1">
              SYSTEM OVERVIEW
            </h1>
            <p className="font-retro text-xl text-vintage">
              Monitoring registrations, shagun volume, and transaction health.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/couples">
              <PixelButton variant="primary" size="sm">
                View Couples
              </PixelButton>
            </Link>
            <Link href="/admin/transactions">
              <PixelButton variant="secondary" size="sm">
                Transaction Ledger
              </PixelButton>
            </Link>
            <Link href="/admin/suspicious">
              <PixelButton variant="ghost" size="sm" className="border-deep">
                ⚠ Suspicious Monitor
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <PixelCard variant="cream" className="border-2 border-deep p-4 text-center space-y-1">
            <div className="font-pixel text-[10px] text-vintage">TOTAL COUPLES</div>
            <div className="font-pixel text-2xl text-deep">{totalCouples}</div>
            <div className="font-retro text-sm text-vintage">Registries created</div>
          </PixelCard>

          <PixelCard variant="cream" className="border-2 border-deep p-4 text-center space-y-1">
            <div className="font-pixel text-[10px] text-vintage">VERIFIED GUESTS</div>
            <div className="font-pixel text-2xl text-deep">{totalGuests}</div>
            <div className="font-retro text-sm text-vintage">Via OTP verification</div>
          </PixelCard>

          <PixelCard variant="cream" className="border-2 border-deep p-4 text-center space-y-1">
            <div className="font-pixel text-[10px] text-vintage">SHAGUN COLLECTED</div>
            <div className="font-pixel text-xl sm:text-2xl text-deep">
              {formatIndianRupees(totalCollectedPaise)}
            </div>
            <div className="font-retro text-sm text-vintage">Total volume settled</div>
          </PixelCard>

          <PixelCard variant="cream" className="border-2 border-deep p-4 text-center space-y-1">
            <div className="font-pixel text-[10px] text-vintage">TOTAL TRANSACTIONS</div>
            <div className="font-pixel text-2xl text-deep">
              {allContributions.length}
            </div>
            <div className="font-retro text-sm text-vintage">
              {successfulTxCount} paid, {failedTxCount} failed
            </div>
          </PixelCard>

          <PixelCard variant="cream" className="border-2 border-deep p-4 text-center space-y-1">
            <div className="font-pixel text-[10px] text-vintage">GOAL COMPLETION</div>
            <div className="font-pixel text-2xl text-deep">{completionRate}%</div>
            <div className="font-retro text-sm text-vintage">
              {completedGoals} of {totalGoals} dreams
            </div>
          </PixelCard>

          <PixelCard
            variant="cream"
            className={`border-2 border-deep p-4 text-center space-y-1 ${
              failedTxCount > 0 ? "bg-red-50" : ""
            }`}
          >
            <div className="font-pixel text-[10px] text-vintage">FAILED / DISPUTED</div>
            <div className="font-pixel text-2xl text-red-700">{failedTxCount}</div>
            <div className="font-retro text-sm text-vintage">Requires review</div>
          </PixelCard>
        </div>

        {/* 2-Column Split: Recent Couples & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Couples */}
          <PixelCard variant="default" className="border-4 border-deep p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-deep pb-2">
              <h3 className="font-pixel text-xs text-deep">RECENT REGISTRATIONS</h3>
              <Link href="/admin/couples" className="font-pixel text-[10px] text-vintage hover:underline">
                VIEW ALL →
              </Link>
            </div>

            {recentCouples.length === 0 ? (
              <p className="font-retro text-xl text-vintage">No couples registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-retro text-lg">
                  <thead>
                    <tr className="border-b border-deep/20 text-vintage font-pixel text-[10px]">
                      <th className="pb-1">COUPLE</th>
                      <th className="pb-1">CODE</th>
                      <th className="pb-1">DATE</th>
                      <th className="pb-1">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-deep/10">
                    {recentCouples.map((c) => (
                      <tr key={c._id.toString()} className="hover:bg-soft-blush">
                        <td className="py-2 font-bold text-deep">
                          {c.partnerOneName} &amp; {c.partnerTwoName}
                        </td>
                        <td className="py-2 font-pixel text-xs text-vintage">
                          {c.weddingCode}
                        </td>
                        <td className="py-2 text-vintage">
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-2">
                          <PixelBadge
                            variant={c.isSuspended ? "archived" : "active"}
                            size="sm"
                          >
                            {c.isSuspended ? "SUSPENDED" : "ACTIVE"}
                          </PixelBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PixelCard>

          {/* Recent Transactions */}
          <PixelCard variant="default" className="border-4 border-deep p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-deep pb-2">
              <h3 className="font-pixel text-xs text-deep">LATEST CONTRIBUTIONS</h3>
              <Link href="/admin/transactions" className="font-pixel text-[10px] text-vintage hover:underline">
                VIEW ALL →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="font-retro text-xl text-vintage">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-retro text-lg">
                  <thead>
                    <tr className="border-b border-deep/20 text-vintage font-pixel text-[10px]">
                      <th className="pb-1">TX ID</th>
                      <th className="pb-1">AMOUNT</th>
                      <th className="pb-1">STATUS</th>
                      <th className="pb-1">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-deep/10">
                    {recentTransactions.map((tx) => (
                      <tr key={tx._id.toString()} className="hover:bg-soft-blush">
                        <td className="py-2 font-mono text-sm text-deep">
                          {tx.transactionId}
                        </td>
                        <td className="py-2 font-bold text-deep">
                          {formatIndianRupees(tx.amount)}
                        </td>
                        <td className="py-2">
                          <PixelBadge
                            variant={
                              tx.paymentStatus === "successful"
                                ? "active"
                                : tx.paymentStatus === "failed"
                                ? "archived"
                                : "pending"
                            }
                            size="sm"
                          >
                            {tx.paymentStatus.toUpperCase()}
                          </PixelBadge>
                        </td>
                        <td className="py-2 text-vintage">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PixelCard>
        </div>
      </main>
    </div>
  );
}
