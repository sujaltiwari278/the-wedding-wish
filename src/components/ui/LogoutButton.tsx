"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { PixelButton, PixelButtonProps } from "@/components/ui/PixelButton";
import { sound } from "@/lib/sound";

export interface LogoutButtonProps extends Omit<PixelButtonProps, "onClick"> {
  redirectTo?: string;
  onLogoutStart?: () => void;
  label?: string;
}

export function LogoutButton({
  redirectTo = "/?loggedOut=1",
  onLogoutStart,
  label = "Logout",
  variant = "ghost",
  size = "sm",
  className,
  children,
  ...props
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    onLogoutStart?.();

    try {
      sound.playClickBeep();
    } catch {
      // ignore audio issues
    }

    try {
      // 1. Clear Guest Session Cookie via API
      await fetch("/api/guest/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});

      // Fallback guest session delete
      await fetch("/api/guest/session", {
        method: "DELETE",
      }).catch(() => {});

      // 2. Clear Couple / NextAuth Session
      // Using redirect: false lets us control the clean page transition to the welcome page
      await signOut({ redirect: false }).catch(() => {});

      // 3. Clear Admin Session Cookie if present
      await fetch("/api/admin/logout", {
        method: "POST",
      }).catch(() => {});
    } finally {
      // Hard navigation to the Welcome Page with loggedOut flag
      // Full window navigation wipes client-side memory state and prevents back-button cache display
      window.location.href = redirectTo;
    }
  };

  return (
    <PixelButton
      type="button"
      variant={variant}
      size={size}
      disabled={isLoggingOut}
      isLoading={isLoggingOut}
      onClick={handleLogout}
      className={className}
      aria-label="Log out of session"
      {...props}
    >
      {children || label}
    </PixelButton>
  );
}
