import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PixelCard } from "@/components/ui/PixelCard";

export const metadata = {
  title: "Privacy Policy | The Wedding Wish",
  description: "Our commitment to strict PII protection, guest number privacy, and payment security.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-xs px-3 py-1.5 border-2 border-deep shadow-pixel-sm uppercase">
            DATA PROTECTION &amp; PII
          </div>
          <h1 className="font-pixel text-3xl md:text-4xl text-deep">
            PRIVACY POLICY
          </h1>
          <p className="font-retro text-2xl text-vintage">
            Last Updated: February 2027
          </p>
        </div>

        <PixelCard variant="cream" className="border-4 border-deep p-6 md:p-8 space-y-6 font-retro text-2xl text-vintage leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              1. STRICT GUEST MOBILE PRIVACY
            </h2>
            <p>
              We treat wedding guest privacy with utmost reverence. When a guest verifies their Indian mobile
              number via SMS OTP, that number is <strong>strictly shielded from public visibility</strong>.
              It is never displayed on public wedding pages, search engines, or guest-facing interfaces.
              Only the authenticated couple who received your shagun can see your mobile number on their private
              dashboard to send personal thank-you notes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              2. PAYMENT SECURITY &amp; RAZORPAY
            </h2>
            <p>
              The Wedding Wish does not collect, store, or process your credit/debit card numbers, UPI PINs,
              or netbanking passwords. All financial transactions are processed securely through <strong>Razorpay</strong>,
              an RBI-licensed and PCI-DSS compliant payment gateway. We only store transaction references (e.g.
              Razorpay Order ID, Payment ID) to reconcile and guarantee idempotent receipt generation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              3. ARTIFICIAL INTELLIGENCE (GEMINI API)
            </h2>
            <p>
              When couples utilize our AI Wedding Goal Assistant or AI Thank-You Generator, data is processed
              server-side through Google Gemini APIs. We do not transmit guest financial accounts or payment
              credentials to AI models. AI prompts are used strictly for in-flight generation and are never used
              to train third-party public models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              4. COOKIES &amp; SESSION TOKENS
            </h2>
            <p>
              We use strictly necessary <code>httpOnly</code>, <code>SameSite=Lax</code>, cryptographically signed
              cookies to maintain authenticated sessions for couples (<code>next-auth.session-token</code>) and
              verified guests (<code>ww_guest_session</code>). We do not deploy third-party advertising trackers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-pixel text-base text-deep border-b-2 border-deep pb-1">
              5. CONTACT &amp; DATA DELETION
            </h2>
            <p>
              Couples and guests may request full deletion of their profiles, contributions history, or personal
              information at any time by contacting our privacy team at <code>privacy@weddingwish.in</code>.
            </p>
          </section>
        </PixelCard>
      </main>

      <PublicFooter />
    </div>
  );
}
