"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { PixelButton } from "@/components/ui/PixelButton";
import {
  PixelCard,
  PixelCardHeader,
  PixelCardContent,
} from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 md:p-8">
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-pixel text-xs text-vintage">
          <span>★</span>
          <span>THE WEDDING WISH</span>
          <span>★</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-pixel text-deep">
          COUPLE LOGIN
        </h1>
        <p className="font-retro text-2xl text-deep/80">
          Enter your sanctuary to manage dreams & view shagun
        </p>
      </div>

      <PixelCard className="w-full max-w-md bg-soft-blush" shadow="lg">
        <PixelCardHeader>
          <div className="flex items-center justify-between w-full">
            <span>RESUME JOURNEY</span>
            <span className="text-xs text-vintage">♥</span>
          </div>
        </PixelCardHeader>

        <PixelCardContent>
          {registered && (
            <div className="p-3 bg-[#E2F0D9] border-2 border-[#548235] text-[#385723] font-retro text-lg mb-3">
              ★ Realm created successfully! Please sign in below.
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg mb-3">
              ⚠ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PixelInput
              label="Couple Email"
              type="email"
              placeholder="our.wedding@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PixelInput
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <PixelButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                ENTER REALM
              </PixelButton>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-deep/20 text-center font-retro text-xl">
            Haven&apos;t created your realm yet?{" "}
            <Link
              href="/register"
              className="font-pixel text-xs text-vintage hover:underline ml-1"
            >
              REGISTER HERE
            </Link>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center font-pixel text-xs">
          LOADING REALM...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
