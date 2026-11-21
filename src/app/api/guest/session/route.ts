import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Guest from "@/models/Guest";
import { getGuestSession, clearGuestCookie } from "@/lib/guest-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getGuestSession();
    if (!session?.guestId) {
      return NextResponse.json({ authenticated: false, guest: null });
    }

    await connectToDatabase();
    const guest = await Guest.findById(session.guestId)
      .select("fullName mobileNumber email relationship mobileVerified")
      .lean();

    if (!guest || !guest.mobileVerified) {
      const response = NextResponse.json({ authenticated: false, guest: null });
      clearGuestCookie(response);
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      guest: {
        id: guest._id.toString(),
        fullName: guest.fullName,
        mobileNumber: guest.mobileNumber,
        email: guest.email,
        relationship: guest.relationship,
        isProfileComplete: Boolean(guest.fullName && guest.fullName.length >= 2),
      },
    });
  } catch (error) {
    console.error("Guest session check error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to check session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out from guest session",
  });
  clearGuestCookie(response);
  return response;
}
