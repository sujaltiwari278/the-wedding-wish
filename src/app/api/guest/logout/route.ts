import { NextResponse } from "next/server";
import { clearGuestCookie } from "@/lib/guest-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out from guest session",
  });
  
  clearGuestCookie(response);
  return response;
}
