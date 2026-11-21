import React from "react";
import Link from "next/link";
import { Sprite } from "@/components/animations/Sprite";

export function PublicFooter() {
  return (
    <footer className="bg-cream border-t-4 border-deep mt-auto">
      {/* Decorative Diya & Marigold Garland Ribbon */}
      <div className="bg-soft-blush border-b-2 border-deep py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprite
              src="/sprites/diya-garland.svg"
              frameWidth={32}
              frameHeight={32}
              frameCount={4}
              fps={4}
              scale={1}
              alt="Pixel Diya"
            />
            <span className="font-pixel text-[10px] text-deep uppercase tracking-widest hidden sm:inline">
              AUSPICIOUS SHAGUN REGISTRY
            </span>
          </div>
          <span className="font-retro text-xl text-vintage">
            ✨ Shagun • Blessings • Dreams ✨
          </span>
          <div className="flex items-center gap-2">
            <Sprite
              src="/sprites/diya-garland.svg"
              frameWidth={32}
              frameHeight={32}
              frameCount={4}
              fps={4}
              scale={1}
              alt="Pixel Diya"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-vintage border border-deep text-cream flex items-center justify-center font-pixel text-xs">
                WW
              </span>
              <span className="font-pixel text-sm text-deep">THE WEDDING WISH</span>
            </div>
            <p className="font-retro text-lg text-vintage leading-relaxed">
              &ldquo;A Little Shagun. A Lifetime of Dreams.&rdquo;
              Modernising Indian wedding gifting into a nostalgic, goal-driven registry experience.
            </p>
            <div className="font-pixel text-[9px] text-deep/70 pt-1">
              BUILT FOR INDIAN WEDDINGS WITH ₹ INR & RAZORPAY
            </div>
          </div>

          {/* Couples */}
          <div className="space-y-2">
            <h4 className="font-pixel text-xs text-deep uppercase tracking-wider border-b-2 border-deep pb-1 inline-block">
              For Couples
            </h4>
            <ul className="space-y-1.5 font-retro text-xl text-vintage">
              <li>
                <Link href="/register" className="hover:text-deep hover:underline">
                  Create Wedding Registry
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-deep hover:underline">
                  Couple Dashboard Login
                </Link>
              </li>
              <li>
                <Link href="/ai/goals" className="hover:text-deep hover:underline">
                  AI Goal Assistant
                </Link>
              </li>
              <li>
                <Link href="/ui-kit" className="hover:text-deep hover:underline">
                  Retro Pixel UI Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <h4 className="font-pixel text-xs text-deep uppercase tracking-wider border-b-2 border-deep pb-1 inline-block">
              For Guests
            </h4>
            <ul className="space-y-1.5 font-retro text-xl text-vintage">
              <li>
                <Link href="/guest" className="hover:text-deep hover:underline">
                  Enter Wedding Code
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-deep hover:underline">
                  How Gifting Works
                </Link>
              </li>
              <li>
                <Link href="/guest/history" className="hover:text-deep hover:underline">
                  My Shagun History
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-deep hover:underline">
                  Payment Security &amp; Receipts
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div className="space-y-2">
            <h4 className="font-pixel text-xs text-deep uppercase tracking-wider border-b-2 border-deep pb-1 inline-block">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-1.5 font-retro text-xl text-vintage">
              <li>
                <Link href="/about" className="hover:text-deep hover:underline">
                  About Our Vision
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-deep hover:underline">
                  Privacy Policy (PII Guard)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-deep hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-deep hover:underline text-deep/70">
                  Admin Portal ⚙
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t-2 border-deep/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-retro text-lg text-vintage">
          <div>
            © {new Date().getFullYear()} The Wedding Wish. All rights reserved.
          </div>
          <div className="font-pixel text-[10px] text-deep flex items-center gap-2">
            <span>PRESS START TO BEGIN</span>
            <span className="inline-block w-2 h-2 bg-deep animate-ping" />
          </div>
        </div>
      </div>
    </footer>
  );
}
