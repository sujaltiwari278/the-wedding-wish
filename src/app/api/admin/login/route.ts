import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { signAdminToken, createAdminCookieHeader } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "admin-ip";
    const rl = checkRateLimit(`admin-login:${ip}`, { maxRequests: 5, windowMs: 60 * 15 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const { email, password } = result.data;
    await connectToDatabase();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = signAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
    });

    response.headers.set("Set-Cookie", createAdminCookieHeader(token));
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during admin authentication." },
      { status: 500 }
    );
  }
}
