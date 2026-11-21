import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGuestSession } from "@/lib/guest-session";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Guest from "@/models/Guest";
import { formatIndianRupees } from "@/lib/money";
import { PixelCard, PixelCardHeader, PixelCardContent, PixelCardFooter } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { ReceiptPrintButton } from "@/components/receipt/ReceiptPrintButton";
import { PaymentCelebrationHeader } from "@/components/receipt/PaymentCelebrationHeader";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

interface ConfirmationPageProps {
  params: {
    transactionId: string;
  };
}

export const metadata = {
  title: "Shagun Receipt & Confirmation | The Wedding Wish",
};

export default async function PaymentConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { transactionId } = params;

  await connectToDatabase();

  const contribution = await Contribution.findOne({ transactionId })
    .populate({ path: "coupleId", select: "partnerOneName partnerTwoName profileSlug" })
    .populate({ path: "goalId", select: "title category image" })
    .populate({ path: "guestId", select: "fullName mobileNumber email relationship" })
    .lean();

  if (!contribution) {
    notFound();
  }

  // Authorization check: Only paying guest or owning couple can view receipt
  const guestSession = await getGuestSession();
  const coupleSession = await getServerSession(authOptions);

  const couple = contribution.coupleId as unknown as { _id?: string; partnerOneName?: string; partnerTwoName?: string; profileSlug?: string } | null;
  const goal = contribution.goalId as unknown as { title?: string; category?: string } | null;
  const guest = contribution.guestId as unknown as { _id?: string; fullName?: string; mobileNumber?: string; email?: string } | null;

  const isPayingGuest =
    guestSession?.guestId && guestSession.guestId === guest?._id?.toString();
  const isOwningCouple =
    coupleSession?.user?.id && coupleSession.user.id === couple?._id?.toString();

  if (!isPayingGuest && !isOwningCouple) {
    redirect("/guest");
  }

  const isSuccess = contribution.paymentStatus === "successful";

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 md:p-8">
      <div className="max-w-xl w-full space-y-6">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/guest" label="← REGISTRY" />
        </div>

        {/* Retro Envelope Animation & Celebration */}
        <PaymentCelebrationHeader
          isSuccess={isSuccess}
          guestName={guest?.fullName}
          goalTitle={goal?.title}
        />

        {/* Printable Pixel Receipt Frame */}
        <div id="pixel-receipt" className="space-y-4">
          <PixelCard variant="cream" shadow="lg" className="border-4 border-deep">
            <PixelCardHeader>
              <div className="flex items-center justify-between w-full">
                <span className="font-pixel text-xs text-deep">
                  OFFICIAL SHAGUN RECEIPT
                </span>
                <PixelBadge
                  variant={isSuccess ? "active" : "archived"}
                  size="sm"
                >
                  {contribution.paymentStatus.toUpperCase()}
                </PixelBadge>
              </div>
            </PixelCardHeader>

            <PixelCardContent className="space-y-4 font-retro text-xl">
              {/* Amount Box */}
              <div className="bg-soft-blush border-2 border-deep p-4 text-center space-y-1">
                <span className="font-pixel text-[10px] text-vintage uppercase block">
                  CONTRIBUTED SHAGUN
                </span>
                <span className="font-pixel text-3xl text-deep font-bold">
                  {formatIndianRupees(contribution.amount)}
                </span>
              </div>

              {/* Ledger Lines */}
              <div className="space-y-2 border-y-2 border-deep/20 py-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-deep/70 text-base sm:text-xl">Transaction ID:</span>
                  <span className="font-pixel text-[10px] sm:text-xs text-deep select-all break-all">
                    {contribution.transactionId}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-deep/70 text-base sm:text-xl">For Couple:</span>
                  <span className="font-pixel text-xs text-deep">
                    {couple?.partnerOneName} & {couple?.partnerTwoName}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-deep/70 text-base sm:text-xl">Dream Funded:</span>
                  <span className="font-pixel text-xs text-deep">
                    {goal?.title}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-deep/70 text-base sm:text-xl">From Contributor:</span>
                  <span className="font-pixel text-xs text-deep">
                    {guest?.fullName || "Honoured Guest"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-deep/70 text-base sm:text-xl">Date & Time:</span>
                  <span className="font-retro text-base sm:text-lg text-deep">
                    {new Date(contribution.paidAt || contribution.createdAt).toLocaleString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>

                {contribution.paymentGatewayReference?.razorpayPaymentId && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-deep/70 text-base sm:text-xl">Payment Ref:</span>
                    <span className="font-retro text-sm sm:text-base text-deep/80 select-all break-all">
                      {contribution.paymentGatewayReference.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              {contribution.guestMessage && (
                <div className="p-3 bg-soft-blush border border-deep/30 space-y-1">
                  <span className="font-pixel text-[9px] text-vintage block uppercase">
                    Your Personal Blessing:
                  </span>
                  <p className="font-retro text-lg italic text-deep">
                    &ldquo;{contribution.guestMessage}&rdquo;
                  </p>
                </div>
              )}
            </PixelCardContent>

            <PixelCardFooter className="print:hidden">
              <div className="flex items-center justify-between w-full flex-wrap gap-3">
                <ReceiptPrintButton />

                <div className="flex gap-2">
                  <Link href={`/wedding/${couple?.profileSlug}`}>
                    <PixelButton size="sm" variant="secondary">
                      Registry Page
                    </PixelButton>
                  </Link>
                  <Link href="/guest">
                    <PixelButton size="sm" variant="primary">
                      Done ✓
                    </PixelButton>
                  </Link>
                </div>
              </div>
            </PixelCardFooter>
          </PixelCard>
        </div>
      </div>
    </div>
  );
}
