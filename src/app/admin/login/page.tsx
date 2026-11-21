"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { sound } from "@/lib/sound";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.playClickBeep();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      sound.playSuccessChime();
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col items-center justify-center p-4 selection:bg-rose-dusty selection:text-deep">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-vintage border-2 border-cream mx-auto flex items-center justify-center text-xl text-cream shadow-pixel-sm">
            ⚙
          </div>
          <h1 className="font-pixel text-xl sm:text-2xl text-cream tracking-wider">
            ADMIN PORTAL
          </h1>
          <p className="font-retro text-xl text-blush">
            The Wedding Wish Platform Administration
          </p>
        </div>

        <PixelCard variant="cream" className="border-4 border-deep p-6 sm:p-8 space-y-5 shadow-pixel-lg">
          <div className="font-pixel text-xs text-deep border-b-2 border-deep pb-2">
            RESTRICTED ACCESS
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-pixel text-xs">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-pixel text-[10px] text-deep block uppercase">
                Admin Email
              </label>
              <PixelInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@weddingwish.in"
                className="bg-cream font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-pixel text-[10px] text-deep block uppercase">
                Admin Password
              </label>
              <PixelInput
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-cream"
              />
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? "AUTHENTICATING..." : "ENTER CONTROL CENTER →"}
            </PixelButton>
          </form>

          <div className="pt-2 text-center font-retro text-base text-vintage border-t border-deep/20">
            Provisioned with secure cryptographic SHA-256 / bcrypt hash &amp; rate-limiting.
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
