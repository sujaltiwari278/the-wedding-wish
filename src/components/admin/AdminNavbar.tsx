"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { sound } from "@/lib/sound";

interface AdminNavbarProps {
  email: string;
  role: string;
}

export function AdminNavbar({ email, role }: AdminNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "OVERVIEW", href: "/admin" },
    { label: "COUPLES", href: "/admin/couples" },
    { label: "TRANSACTIONS", href: "/admin/transactions" },
    { label: "SUSPICIOUS MONITOR", href: "/admin/suspicious" },
  ];

  return (
    <header className="bg-deep text-cream border-b-4 border-deep sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            onClick={() => sound.playClickBeep()}
            className="flex items-center gap-2 font-pixel text-xs sm:text-base tracking-wider text-cream"
          >
            <span className="w-8 h-8 bg-vintage border-2 border-cream flex items-center justify-center text-xs">
              ⚙
            </span>
            <span>WW ADMIN</span>
          </Link>
          <span className="font-pixel text-[9px] bg-vintage text-cream px-2 py-0.5 border border-cream/50 uppercase">
            {role}
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => sound.playClickBeep()}
                className={`font-pixel text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-rose-dusty border-b-2 border-rose-dusty pb-1"
                    : "text-cream/80 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Info & Logout */}
        <div className="hidden md:flex items-center gap-3">
          <span className="font-retro text-lg text-cream/80 hidden lg:inline max-w-[180px] truncate">
            {email}
          </span>
          <LogoutButton
            variant="ghost"
            size="sm"
            className="border-cream text-cream hover:bg-cream/20 text-[10px]"
          />
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {pathname !== "/admin" && (
            <Link
              href="/admin"
              onClick={() => sound.playClickBeep()}
              className="flex items-center justify-center w-10 h-10 border-2 border-cream bg-vintage text-cream font-pixel text-xs shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5"
              title="Back to Admin Overview"
              aria-label="Back to Admin Overview"
            >
              ◀
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center border-2 border-cream bg-vintage text-cream font-pixel text-xs shadow-pixel-sm"
            aria-label="Toggle admin navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-cream/30 bg-deep px-4 py-3 space-y-3">
          <div className="font-retro text-base text-cream/80 truncate border-b border-cream/20 pb-1">
            Logged in as: {email}
          </div>
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    sound.playClickBeep();
                    setMobileMenuOpen(false);
                  }}
                  className={`font-pixel text-xs py-2 px-3 border border-cream/40 transition-colors ${
                    isActive
                      ? "bg-rose-dusty text-deep font-bold"
                      : "bg-vintage/50 text-cream hover:bg-vintage"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-2 border-t border-cream/20">
            <LogoutButton
              variant="danger"
              size="md"
              className="w-full text-center"
              onLogoutStart={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
