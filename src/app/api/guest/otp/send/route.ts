import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OTP from "@/models/OTP";
import {
  normalizeIndianMobile,
  generateOtp,
  hashOtp,
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
} from "@/lib/otp";
import { getSmsProvider } from "@/lib/sms";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";

    // 1. IP rate limiting (max 10 requests / 5 mins)
    const ipLimit = checkRateLimit(`otp-send-ip:${clientIp}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests from this network. Try again in ${ipLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { mobileNumber } = body;

    // 2. Mobile Number Validation (Indian +91)
    const normalized = normalizeIndianMobile(mobileNumber);
    if (!normalized.isValid) {
      return NextResponse.json(
        { error: normalized.error || "Invalid mobile number" },
        { status: 400 }
      );
    }

    const e164Mobile = normalized.e164;

    // 3. Per-number rate limiting (max 3 OTPs / 5 mins)
    const numberLimit = checkRateLimit(`otp-send-num:${e164Mobile}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 3,
    });
    if (!numberLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many OTP requests for this mobile. Please wait ${numberLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // 4. Cooldown Check (30 seconds)
    const activeOtp = await OTP.findOne({ mobileNumber: e164Mobile })
      .sort({ createdAt: -1 })
      .lean();

    if (activeOtp) {
      const timeSinceLastSend = Date.now() - new Date(activeOtp.lastSentAt).getTime();
      if (timeSinceLastSend < RESEND_COOLDOWN_MS) {
        const remainingCooldown = Math.ceil(
          (RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000
        );
        return NextResponse.json(
          {
            error: `Please wait ${remainingCooldown}s before requesting a new OTP.`,
          },
          { status: 429 }
        );
      }
    }

    // 5. Generate 6-digit OTP and hash
    const plainOtp = generateOtp();
    const hashed = hashOtp(plainOtp, e164Mobile);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Replace any previous OTP for this number
    await OTP.deleteMany({ mobileNumber: e164Mobile });

    await OTP.create({
      mobileNumber: e164Mobile,
      hashedOTP: hashed,
      expiresAt,
      attempts: 0,
      verified: false,
      lastSentAt: new Date(),
    });

    // 6. Dispatch via SMS provider
    const smsMessage = `Your Wedding Wish Shagun verification OTP is ${plainOtp}. Valid for 5 minutes. Please do not share this with anyone.`;
    const smsProvider = getSmsProvider();
    await smsProvider.send(e164Mobile, smsMessage);

    return NextResponse.json({
      success: true,
      message: "6-digit OTP sent to your mobile number.",
      cooldownSeconds: 30,
      // For local testing convenience if console isn't directly viewed:
      devHint:
        process.env.NODE_ENV !== "production"
          ? `[Dev Console] OTP: ${plainOtp}`
          : undefined,
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification OTP" },
      { status: 500 }
    );
  }
}
