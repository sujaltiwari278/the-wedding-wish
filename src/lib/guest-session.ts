import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GUEST_COOKIE_NAME = "ww_guest_session";
const GUEST_JWT_SECRET =
  process.env.NEXTAUTH_SECRET || "wedding_wish_guest_jwt_secret_123";
const GUEST_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface GuestJwtPayload {
  guestId: string;
  mobileNumber: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

/**
 * Creates a signed JWT for an authenticated guest
 */
export function createGuestToken(payload: {
  guestId: string;
  mobileNumber: string;
  fullName: string;
}): string {
  return jwt.sign(payload, GUEST_JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verifies a guest JWT token
 */
export function verifyGuestToken(token: string): GuestJwtPayload | null {
  try {
    return jwt.verify(token, GUEST_JWT_SECRET) as GuestJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the signed httpOnly guest session cookie on a NextResponse
 */
export function setGuestCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_SESSION_MAX_AGE,
  });
}

/**
 * Clears the guest session cookie
 */
export function clearGuestCookie(res: NextResponse): void {
  res.cookies.delete(GUEST_COOKIE_NAME);
  res.cookies.set(GUEST_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
}

/**
 * Retrieves the verified guest session from server components or route handlers
 */
export async function getGuestSession(): Promise<GuestJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyGuestToken(token);
}
