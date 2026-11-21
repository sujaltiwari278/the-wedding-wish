"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelButton } from "@/components/ui/PixelButton";
import { sound } from "@/lib/sound";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sound.isMuted());
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const navLinks = [
    { label: "HOW IT WORKS", href: "/how-it-works" },
    { label: "FEATURES", href: "/features" },
    { label: "ABOUT", href: "/about" },
    { label: "ENTER CODE", href: "/guest" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-none border-b-4 border-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => sound.playClickBeep()}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-rose-dusty border-2 border-deep flex items-center justify-center text-lg shadow-pixel-sm group-hover:bg-vintage group-hover:text-cream transition-colors">
            💌
          </div>
          <div>
            <span className="font-pixel text-xs sm:text-sm md:text-base text-deep tracking-wider block">
              THE WEDDING WISH
            </span>
            <span className="font-retro text-sm text-vintage leading-none block -mt-1 hidden sm:block">
              A Little Shagun. A Lifetime of Dreams.
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => sound.playClickBeep()}
                className={`font-pixel text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-deep border-b-2 border-deep pb-0.5"
                    : "text-vintage hover:text-deep"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="w-8 h-8 flex items-center justify-center border-2 border-deep bg-soft-blush text-deep shadow-pixel-sm hover:bg-blush"
            title={isMuted ? "Unmute Retro Sounds" : "Mute Retro Sounds"}
            aria-label="Toggle Sound"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          <Link href="/login" onClick={() => sound.playClickBeep()}>
            <PixelButton variant="ghost" size="sm">
              Log In
            </PixelButton>
          </Link>
          <Link href="/register" onClick={() => sound.playClickBeep()}>
            <PixelButton variant="primary" size="sm">
              Start Registry
            </PixelButton>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className="w-8 h-8 flex items-center justify-center border-2 border-deep bg-soft-blush text-xs"
            aria-label="Toggle Sound"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-deep bg-soft-blush text-deep font-pixel text-xs shadow-pixel-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-deep bg-soft-blush p-4 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  sound.playClickBeep();
                  setMobileMenuOpen(false);
                }}
                className="font-pixel text-xs text-deep py-2 px-3 border border-deep bg-cream hover:bg-blush"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-deep/30">
            <Link
              href="/login"
              onClick={() => {
                sound.playClickBeep();
                setMobileMenuOpen(false);
              }}
            >
              <PixelButton variant="secondary" size="md" className="w-full">
                Couple Login
              </PixelButton>
            </Link>
            <Link
              href="/register"
              onClick={() => {
                sound.playClickBeep();
                setMobileMenuOpen(false);
              }}
            >
              <PixelButton variant="primary" size="md" className="w-full">
                Create Free Registry
              </PixelButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
