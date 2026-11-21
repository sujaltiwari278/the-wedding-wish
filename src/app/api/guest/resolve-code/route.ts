import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limit by client IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rateLimit = checkRateLimit(`code-resolve:${clientIp}`, {
      windowMs: 60 * 1000,
      maxRequests: 15, // max 15 attempts per minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many wedding code attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawCode = body.weddingCode;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid wedding code" },
        { status: 400 }
      );
    }

    // Clean code: uppercase, strip spaces and hyphens
    const cleanCode = rawCode.toUpperCase().replace(/[\s-]/g, "").trim();

    await connectToDatabase();
    const couple = await Couple.findOne({ weddingCode: cleanCode })
      .select(
        "partnerOneName partnerTwoName weddingDate profileSlug weddingDescription profileImage"
      )
      .lean();

    if (!couple) {
      return NextResponse.json(
        { error: "No couple realm found with this wedding code. Please check and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      couple: {
        id: couple._id.toString(),
        partnerOneName: couple.partnerOneName,
        partnerTwoName: couple.partnerTwoName,
        weddingDate: couple.weddingDate,
        profileSlug: couple.profileSlug,
        weddingDescription: couple.weddingDescription,
        profileImage: couple.profileImage || "avatar-couple-1",
      },
    });
  } catch (error) {
    console.error("Resolve code error:", error);
    return NextResponse.json(
      { error: "Failed to resolve wedding code" },
      { status: 500 }
    );
  }
}
