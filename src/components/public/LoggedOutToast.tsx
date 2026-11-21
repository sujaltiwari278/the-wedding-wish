"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function LoggedOutToast() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("loggedOut") === "1") {
      setShowToast(true);
      // Clean up URL query parameter without a reload
      const url = new URL(window.location.href);
      url.searchParams.delete("loggedOut");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-cream border-4 border-deep shadow-pixel-lg p-3 sm:p-4 animate-bounce"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">💌</span>
          <div>
            <div className="font-pixel text-[10px] text-deep uppercase tracking-wider font-bold">
              LOGGED OUT SAFELY
            </div>
            <div className="font-retro text-base text-vintage">
              You have been signed out. Welcome back anytime!
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowToast(false)}
          className="font-pixel text-xs text-deep hover:text-vintage px-1"
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
