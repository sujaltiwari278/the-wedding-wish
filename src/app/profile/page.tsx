import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { WeddingCountdown } from "@/components/couple/WeddingCountdown";
import { SharingPanel } from "@/components/couple/SharingPanel";
import { ProfileForm } from "@/components/couple/ProfileForm";
import { PixelBackButton } from "@/components/ui/PixelBackButton";
import { generateQrDataUrl } from "@/lib/qr";

export const metadata = {
  title: "Couple Profile & Sharing | The Wedding Wish",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  await connectToDatabase();
  const couple = await Couple.findById(session.user.id).lean();

  if (!couple) {
    redirect("/login");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicProfileUrl = `${baseUrl}/wedding/${couple.profileSlug}`;
  const qrDataUrl = await generateQrDataUrl(publicProfileUrl);

  const profileData = {
    id: couple._id.toString(),
    partnerOneName: couple.partnerOneName,
    partnerTwoName: couple.partnerTwoName,
    email: couple.email,
    mobileNumber: couple.mobileNumber,
    weddingDate: couple.weddingDate.toISOString(),
    weddingCode: couple.weddingCode,
    profileSlug: couple.profileSlug,
    weddingDescription: couple.weddingDescription,
    coupleStory: couple.coupleStory || "",
    profileImage: couple.profileImage || "avatar-couple-1",
    showWishesPublicly: couple.showWishesPublicly ?? true,
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/dashboard" label="← DASHBOARD" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase">
            REGISTRY CONFIGURATION
          </div>
          <h1 className="text-2xl md:text-3xl font-pixel text-deep">
            COUPLE PROFILE & SHARING
          </h1>
          <p className="font-retro text-2xl text-deep/80">
            Share your unique wedding code with loved ones and tailor your story.
          </p>
        </div>

        {/* Wedding Countdown */}
        <WeddingCountdown weddingDate={couple.weddingDate} />

        {/* Sharing Panel: QR, Code, URL */}
        <SharingPanel
          weddingCode={couple.weddingCode}
          profileSlug={couple.profileSlug}
          qrDataUrl={qrDataUrl}
        />

        {/* Profile Settings Form */}
        <ProfileForm initialData={profileData} />
      </main>
    </div>
  );
}
