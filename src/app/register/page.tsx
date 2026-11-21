"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PixelButton } from "@/components/ui/PixelButton";
import {
  PixelCard,
  PixelCardHeader,
  PixelCardContent,
} from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    partnerOneName: "",
    partnerTwoName: "",
    email: "",
    mobileNumber: "",
    weddingDate: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to register. Please check your inputs.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user
      const loginRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginRes?.error) {
        // Redirect to login if auto-login fails
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 md:p-8">
      {/* Pixel Garland Top Accent */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-pixel text-xs text-vintage">
          <span>♥</span>
          <span>THE WEDDING WISH</span>
          <span>♥</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-pixel text-deep">
          CREATE COUPLE REALM
        </h1>
        <p className="font-retro text-2xl text-deep/80">
          Begin your journey and build your shagun registry
        </p>
      </div>

      <PixelCard className="w-full max-w-xl bg-soft-blush" shadow="lg">
        <PixelCardHeader>
          <div className="flex items-center justify-between w-full">
            <span>COUPLE REGISTRATION</span>
            <span className="text-xs text-vintage font-normal">LVL 1</span>
          </div>
        </PixelCardHeader>

        <PixelCardContent>
          {errorMessage && (
            <div className="p-3 bg-[#FCE4D6] border-2 border-[#C00000] text-[#C00000] font-retro text-lg">
              ⚠ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Partner 1 Name"
                name="partnerOneName"
                placeholder="e.g. Sujal"
                required
                value={formData.partnerOneName}
                onChange={handleChange}
              />
              <PixelInput
                label="Partner 2 Name"
                name="partnerTwoName"
                placeholder="e.g. Priya"
                required
                value={formData.partnerTwoName}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Email Address"
                type="email"
                name="email"
                placeholder="our.wedding@email.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <PixelInput
                label="Mobile Number (India)"
                type="tel"
                name="mobileNumber"
                placeholder="+91 9876543210"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>

            <PixelInput
              label="Wedding Date"
              type="date"
              name="weddingDate"
              required
              value={formData.weddingDate}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PixelInput
                label="Secret Password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <PixelInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <PixelButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                START REGISTRY JOURNEY
              </PixelButton>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-deep/20 text-center font-retro text-xl">
            Already have an active realm?{" "}
            <Link
              href="/login"
              className="font-pixel text-xs text-vintage hover:underline ml-1"
            >
              LOG IN HERE
            </Link>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
