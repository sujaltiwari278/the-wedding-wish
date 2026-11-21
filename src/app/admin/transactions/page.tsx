import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Guest from "@/models/Guest";
import Wish from "@/models/Wish";
import {
  TransactionLedgerTable,
  TransactionItem,
} from "@/components/admin/TransactionLedgerTable";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export const metadata = {
  title: "Transaction Ledger | Admin Portal | The Wedding Wish",
};

export default async function AdminTransactionsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const contributions = await Contribution.find({})
    .populate({ path: "coupleId", select: "partnerOneName partnerTwoName weddingCode" })
    .populate({ path: "goalId", select: "title" })
    .populate({ path: "guestId", select: "fullName mobileNumber email" })
    .sort({ createdAt: -1 })
    .lean();

  const wishes = await Wish.find({}).lean();

  const transactionItems: TransactionItem[] = contributions.map((c) => {
    const couple = c.coupleId as unknown as {
      partnerOneName?: string;
      partnerTwoName?: string;
      weddingCode?: string;
    } | null;
    const goal = c.goalId as unknown as { title?: string } | null;
    const guest = c.guestId as unknown as {
      fullName?: string;
      mobileNumber?: string;
      email?: string;
    } | null;

    const attachedWish = wishes.find(
      (w) => w.contributionId?.toString() === c._id.toString()
    );

    return {
      id: c._id.toString(),
      transactionId: c.transactionId || `WW-${c._id.toString().substring(0, 8)}`,
      amountPaise: c.amount || 0,
      paymentStatus: (c.paymentStatus as TransactionItem["paymentStatus"]) || "pending",
      createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
      coupleName: couple
        ? `${couple.partnerOneName} & ${couple.partnerTwoName}`
        : "Unknown Couple",
      weddingCode: couple?.weddingCode || "N/A",
      goalTitle: goal?.title || "Direct Shagun",
      guestName: guest?.fullName || "Anonymous Guest",
      guestMobile: guest?.mobileNumber || "N/A",
      guestEmail: guest?.email,
      wishMessage: attachedWish?.message,
      razorpayOrderId: c.paymentGatewayReference?.razorpayOrderId,
      razorpayPaymentId: c.paymentGatewayReference?.razorpayPaymentId,
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
            REAL-TIME FINANCIAL AUDIT
          </div>
          <h1 className="font-pixel text-2xl sm:text-3xl text-deep mt-1">
            SHAGUN TRANSACTION LEDGER
          </h1>
          <p className="font-retro text-xl text-vintage">
            Comprehensive audit log of all gateway orders, payments, receipts, and disputes.
          </p>
        </div>

        <TransactionLedgerTable initialTransactions={transactionItems} />
      </main>
    </div>
  );
}
