"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PixelButton } from "@/components/ui/PixelButton";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { sound } from "@/lib/sound";

export function CoupleNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/goals", label: "Dreams" },
    { href: "/ai/goals", label: "AI Assistant" },
    { href: "/wishes", label: "Wishes Wall" },
    { href: "/profile", label: "Profile & QR" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="bg-soft-blush border-b-4 border-deep px-3 sm:px-6 py-2.5 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Names */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span>💍</span>
            <span className="text-sm lg:text-base">THE WEDDING WISH</span>
          </Link>
          {session?.user && (
            <span className="hidden 2xl:inline-block font-retro text-lg text-vintage border-l-2 border-deep/30 pl-3 truncate max-w-[200px]">
              {session.user.partnerOneName} &amp; {session.user.partnerTwoName}
            </span>
          )}
        </div>

        {/* Desktop Links & Actions */}
        <div className="hidden xl:flex items-center gap-3">
          <nav className="flex shrink-0 items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => sound.playClickBeep()}
                  className={`font-pixel text-[10px] xl:text-xs uppercase whitespace-nowrap px-2 xl:px-2.5 py-1.5 border-2 transition-all select-none ${
                    isActive
                      ? "bg-vintage text-cream border-deep shadow-pixel-sm translate-y-[-1px]"
                      : "bg-cream text-deep border-transparent hover:border-deep/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {session?.user?.profileSlug && (
              <Link
                href={`/wedding/${session.user.profileSlug}`}
                target="_blank"
                rel="noreferrer"
              >
                <PixelButton variant="secondary" size="sm">
                  View Public ↗
                </PixelButton>
              </Link>
            )}

            <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex xl:hidden items-center gap-2">
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              onClick={() => sound.playClickBeep()}
              className="flex items-center justify-center w-10 h-10 border-2 border-deep bg-cream hover:bg-blush text-deep font-pixel text-xs shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              ◀
            </Link>
          )}

          {session?.user?.profileSlug && (
            <Link
              href={`/wedding/${session.user.profileSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden xs:inline-block"
            >
              <PixelButton variant="secondary" size="sm" className="px-2 py-1 text-[9px]">
                Public ↗
              </PixelButton>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playClickBeep();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="w-10 h-10 flex items-center justify-center border-2 border-deep bg-cream text-deep font-pixel text-sm shadow-pixel-sm"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t-2 border-deep/30 bg-soft-blush pt-3 pb-2 mt-2 space-y-2">
          {session?.user && (
            <div className="px-2 pb-1 font-retro text-lg text-vintage font-bold border-b border-deep/20">
              {session.user.partnerOneName} &amp; {session.user.partnerTwoName}
            </div>
          )}

          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    sound.playClickBeep();
                    setMobileMenuOpen(false);
                  }}
                  className={`font-pixel text-xs py-2 px-3 border-2 transition-colors ${
                    isActive
                      ? "bg-vintage text-cream border-deep shadow-pixel-sm"
                      : "bg-cream text-deep border-deep/40 hover:bg-blush"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-deep/20 flex flex-col gap-2">
            {session?.user?.profileSlug && (
              <Link
                href={`/wedding/${session.user.profileSlug}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PixelButton variant="secondary" size="md" className="w-full">
                  View Public Wedding Registry ↗
                </PixelButton>
              </Link>
            )}

            <LogoutButton
              variant="danger"
              size="md"
              className="w-full"
              onLogoutStart={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}