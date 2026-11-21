import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OTP from "@/models/OTP";
import Guest from "@/models/Guest";
import AuditLog from "@/models/AuditLog";
import {
  normalizeIndianMobile,
  verifyOtpHash,
  MAX_ATTEMPTS,
} from "@/lib/otp";
import { createGuestToken, setGuestCookie } from "@/lib/guest-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber, otp } = body;

    const normalized = normalizeIndianMobile(mobileNumber);
    if (!normalized.isValid) {
      return NextResponse.json(
        { error: normalized.error || "Invalid mobile number" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit OTP code" },
        { status: 400 }
      );
    }

    const cleanOtp = otp.trim();
    const e164Mobile = normalized.e164;

    await connectToDatabase();

    const otpDoc = await OTP.findOne({ mobileNumber: e164Mobile }).sort({
      createdAt: -1,
    });

    if (!otpDoc) {
      return NextResponse.json(
        { error: "No active OTP found. Please request a new code." },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteMany({ mobileNumber: e164Mobile });
      return NextResponse.json(
        { error: "This OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteMany({ mobileNumber: e164Mobile });
      return NextResponse.json(
        {
          error:
            "Maximum verification attempts exceeded. For your security, this OTP is locked. Please request a new one.",
        },
        { status: 403 }
      );
    }

    // Verify hash
    const isValid = verifyOtpHash(cleanOtp, e164Mobile, otpDoc.hashedOTP);

    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      const remainingAttempts = MAX_ATTEMPTS - otpDoc.attempts;
      return NextResponse.json(
        {
          error: `Incorrect OTP. ${remainingAttempts} ${
            remainingAttempts === 1 ? "attempt" : "attempts"
          } remaining before lockout.`,
          attemptsRemaining: remainingAttempts,
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------
    // OTP is valid. IMPORTANT: do NOT delete the OTP yet.
    // First make sure the guest exists. If anything below fails, the OTP
    // stays usable and the user can simply retry.
    // ------------------------------------------------------------------

    // Find or create Guest (strictly one guest account per mobile number)
    let guest = await Guest.findOne({ mobileNumber: e164Mobile });
    let isNewUser = false;

    if (!guest) {
      try {
        guest = await Guest.create({
          fullName: "", // collected later in the "tell us about you" step
          mobileNumber: e164Mobile,
          email: "",
          relationship: "Other",
          mobileVerified: true,
        });
        isNewUser = true;

        await AuditLog.create({
          event: "GUEST_REGISTERED",
          actorType: "guest",
          actorId: guest._id.toString(),
          refId: e164Mobile,
        });
      } catch (createErr: unknown) {
        // Two simultaneous verifies can both try to create the same guest.
        // The unique index on mobileNumber rejects the second one, so just
        // load the guest the first request created.
        const code = (createErr as { code?: number }).code;
        if (code === 11000) {
          guest = await Guest.findOne({ mobileNumber: e164Mobile });
        } else {
          throw createErr;
        }
      }
    } else {
      guest.mobileVerified = true;
      await guest.save();
    }

    if (!guest) {
      throw new Error("Guest could not be created or loaded");
    }

    // Create signed JWT session
    const token = createGuestToken({
      guestId: guest._id.toString(),
      mobileNumber: guest.mobileNumber,
      fullName: guest.fullName || "",
    });

    // Everything succeeded, so NOW it is safe to consume the OTP
    await OTP.deleteMany({ mobileNumber: e164Mobile });

    const response = NextResponse.json({
      success: true,
      message: "Mobile verified successfully!",
      isNewUser: isNewUser || !guest.fullName,
      guest: {
        id: guest._id.toString(),
        fullName: guest.fullName,
        mobileNumber: guest.mobileNumber,
        email: guest.email,
        relationship: guest.relationship,
      },
    });

    // Attach signed httpOnly cookie
    setGuestCookie(response, token);

    return response;
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json(
      { error: "Verification process failed. Please try again." },
      { status: 500 }
    );
  }
}