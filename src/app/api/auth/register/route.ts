import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import AuditLog from "@/models/AuditLog";
import {
  generateUniqueWeddingCode,
  generateUniqueProfileSlug,
} from "@/lib/code-generator";

const registerSchema = z
  .object({
    partnerOneName: z.string().min(2, "Partner 1 name must be at least 2 characters").max(50),
    partnerTwoName: z.string().min(2, "Partner 2 name must be at least 2 characters").max(50),
    email: z.string().email("Please provide a valid email address"),
    mobileNumber: z
      .string()
      .min(10, "Please provide a valid mobile number")
      .max(15)
      .regex(/^[+0-9\s-]+$/, "Invalid mobile number characters"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    weddingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid wedding date",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Turns a raw database error into an accurate, user-friendly message.
 * Returns null if the error does not look like a database connection problem.
 */
function describeDatabaseError(err: Error): string | null {
  const msg = err.message || "";
  const name = err.name || "";

  if (msg.includes("MONGODB_URI is missing")) {
    return "MONGODB_URI is missing. Add it to .env.local in the project root and restart the dev server.";
  }
  if (msg.includes("bad auth") || msg.includes("Authentication failed")) {
    return "Database login failed: the username or password in MONGODB_URI is wrong.";
  }
  if (msg.includes("querySrv") || msg.includes("ENOTFOUND")) {
    return "Could not reach MongoDB Atlas: a DNS or network problem (try another network or set DNS to 8.8.8.8).";
  }
  if (
    name === "MongooseServerSelectionError" ||
    msg.includes("whitelist") ||
    msg.includes("Could not connect to any servers") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("timed out")
  ) {
    return "Could not connect to the database. Check Atlas Network Access (allow your IP or 0.0.0.0/0) and that MONGODB_URI is correct.";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      partnerOneName,
      partnerTwoName,
      email,
      mobileNumber,
      password,
      weddingDate,
    } = validated.data;

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingCouple = await Couple.findOne({ email: normalizedEmail }).lean();
    if (existingCouple) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate collision-safe wedding code and profile slug
    const weddingCode = await generateUniqueWeddingCode();
    const profileSlug = await generateUniqueProfileSlug(partnerOneName, partnerTwoName);

    const newCouple = await Couple.create({
      partnerOneName: partnerOneName.trim(),
      partnerTwoName: partnerTwoName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber.trim(),
      passwordHash,
      weddingDate: new Date(weddingDate),
      weddingCode,
      profileSlug,
      emailVerified: false,
      mobileVerified: false,
    });

    // TODO: Phase 2/3 - Account verification hook: send email/SMS confirmation OTP
    // await sendAccountVerificationEmail(newCouple.email);

    // Audit log
    await AuditLog.create({
      event: "COUPLE_REGISTERED",
      actorType: "couple",
      actorId: newCouple._id.toString(),
      refId: newCouple.weddingCode,
      metadata: {
        profileSlug: newCouple.profileSlug,
        email: newCouple.email,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Couple account created successfully!",
        data: {
          id: newCouple._id.toString(),
          weddingCode: newCouple.weddingCode,
          profileSlug: newCouple.profileSlug,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Always log the REAL error to the terminal so it can be diagnosed
    console.error("REAL REGISTRATION ERROR:", error);

    const err = error as Error;
    const dbMessage = describeDatabaseError(err);

    if (dbMessage) {
      return NextResponse.json(
        { error: `${dbMessage} (Details: ${err.message})` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          err.message ||
          "An unexpected error occurred while creating your account. Please try again.",
      },
      { status: 500 }
    );
  }
}