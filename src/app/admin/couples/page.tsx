import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import { CoupleInspectorTable, CoupleItem } from "@/components/admin/CoupleInspectorTable";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export const metadata = {
  title: "Couple Inspector | Admin Portal | The Wedding Wish",
};

export default async function AdminCouplesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const couples = await Couple.find({}).sort({ createdAt: -1 }).lean();
  const goals = await Goal.find({}).lean();
  const successfulContributions = await Contribution.find({
    paymentStatus: "successful",
  }).lean();

  const coupleItems: CoupleItem[] = couples.map((c) => {
    const coupleGoals = goals.filter(
      (g) => g.coupleId?.toString() === c._id.toString()
    );
    const totalCollected = successfulContributions
      .filter((tx) => tx.coupleId?.toString() === c._id.toString())
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      id: c._id.toString(),
      partnerOneName: c.partnerOneName,
      partnerTwoName: c.partnerTwoName,
      email: c.email,
      mobileNumber: c.mobileNumber,
      weddingCode: c.weddingCode,
      profileSlug: c.profileSlug,
      weddingDate: c.weddingDate?.toISOString() || new Date().toISOString(),
      createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
      isSuspended: !!c.isSuspended,
      goalsCount: coupleGoals.length,
      totalCollectedPaise: totalCollected,
    };
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AdminNavbar email={session.email} role={session.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/admin" label="← ADMIN OVERVIEW" />
        </div>

        <div className="border-b-4 border-deep pb-4">
          <div className="inline-block bg-vintage text-cream font-pixel text-[10px] px-2 py-0.5 uppercase border border-deep">
            DIRECTORY &amp; MODERATION
          </div>
          <h1 className="font-pixel text-2xl sm:text-3xl text-deep mt-1">
            COUPLE REGISTRIES INSPECTOR
          </h1>
          <p className="font-retro text-xl text-vintage">
            Search, review, inspect goals, or manage active registry statuses.
          </p>
        </div>

        <CoupleInspectorTable initialCouples={coupleItems} />
      </main>
    </div>
  );
}
