import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Guest from "@/models/Guest";
import {
  getGuestSession,
  createGuestToken,
  setGuestCookie,
} from "@/lib/guest-session";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  relationship: z
    .enum(["Family", "Friend", "Colleague", "Neighbour", "Other"])
    .default("Other"),
});

export async function PATCH(req: Request) {
  try {
    const session = await getGuestSession();
    if (!session?.guestId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = profileSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await connectToDatabase();

    const guest = await Guest.findByIdAndUpdate(
      session.guestId,
      {
        fullName: validated.data.fullName.trim(),
        email: validated.data.email?.toLowerCase().trim() || "",
        relationship: validated.data.relationship,
      },
      { new: true }
    );

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Refresh token with new name
    const newToken = createGuestToken({
      guestId: guest._id.toString(),
      mobileNumber: guest.mobileNumber,
      fullName: guest.fullName,
    });

    const response = NextResponse.json({
      success: true,
      guest: {
        id: guest._id.toString(),
        fullName: guest.fullName,
        mobileNumber: guest.mobileNumber,
        email: guest.email,
        relationship: guest.relationship,
      },
    });

    setGuestCookie(response, newToken);
    return response;
  } catch (error) {
    console.error("Guest profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile details" },
      { status: 500 }
    );
  }
}
