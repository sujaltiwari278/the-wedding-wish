import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelCard } from "@/components/ui/PixelCard";

export const metadata = {
  title: "Terms of Service | The Wedding Wish",
  description: "Terms and conditions governing the use of The Wedding Wish platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-3 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            LEGAL AGREEMENT
          </div>
          <h1 className="font-pixel text-3xl md:text-4xl text-deep">
            TERMS OF SERVICE
          </h1>
          <p className="font-retro text-2xl text-vintage">
            Last Updated: February 2027
          </p>
        </div>

        <PixelCard variant="cream" className="border-4 border-deep p-6 md:p-8 space-y-6 font-retro text-2xl text-vintage leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              1. ACCEPTANCE OF TERMS
            </h2>
            <p>
              By accessing or using The Wedding Wish (the &ldquo;Platform&rdquo;), whether as a couple setting up a
              registry or as a wedding guest offering shagun, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              2. NATURE OF SHAGUN CONTRIBUTIONS
            </h2>
            <p>
              The Wedding Wish is a software platform facilitating voluntary celebratory cash gifting (<em>shagun</em>)
              from wedding guests directly to verified couples. Contributions are voluntary celebratory gifts and do
              not constitute investments, loans, donations to charities, or equity crowdfunding.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              3. USER CONDUCT &amp; AUTHENTICITY
            </h2>
            <p>
              Couples agree to provide authentic information regarding their wedding celebrations. Creation of
              fraudulent registries, impersonation of couples, or solicitation of unauthorized funds is strictly
              prohibited and will result in immediate profile suspension and reporting to relevant authorities.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              4. PAYMENT PROCESSING &amp; REFUNDS
            </h2>
            <p>
              All payments are processed in Indian Rupees (INR) through Razorpay. Once a contribution has succeeded
              and an official receipt is issued, shagun transactions are final and non-refundable, except in cases
              of demonstrated technical double-debit or fraudulent gateway errors, in which case refund requests
              can be logged through our support desk.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              5. LIMITATION OF LIABILITY
            </h2>
            <p>
              The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. The Wedding Wish
              is not liable for banking network outages, SMS gateway delays, or disputes between couples and guests
              concerning registry gifts.
            </p>
          </section>
        </PixelCard>
      </main>

      <PublicFooter />
    </div>
  );
}
