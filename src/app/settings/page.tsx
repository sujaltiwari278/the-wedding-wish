import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import { CoupleNavbar } from "@/components/couple/CoupleNavbar";
import { SettingsForm } from "@/components/couple/SettingsForm";
import { PixelBackButton } from "@/components/ui/PixelBackButton";

export const metadata = {
  title: "Couple Settings | The Wedding Wish",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings");
  }

  await connectToDatabase();
  const couple = await Couple.findById(session.user.id).lean();

  if (!couple) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <CoupleNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/dashboard" label="← DASHBOARD" />
        </div>

        <div>
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase mb-2">
            PREFERENCES & SECURITY
          </div>
          <h1 className="text-2xl md:text-3xl font-pixel text-deep">
            SANCTUARY SETTINGS
          </h1>
          <p className="font-retro text-2xl text-deep/80">
            Configure public visibility, contact details, and account security.
          </p>
        </div>

        <SettingsForm
          initialSettings={{
            showWishesPublicly: couple.showWishesPublicly ?? true,
            partnerOneName: couple.partnerOneName,
            partnerTwoName: couple.partnerTwoName,
            email: couple.email,
            mobileNumber: couple.mobileNumber,
          }}
        />
      </main>
    </div>
  );
}
