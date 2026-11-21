import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  showWishesPublicly: z.boolean().optional(),
  partnerOneName: z.string().min(2).max(50).optional(),
  partnerTwoName: z.string().min(2).max(50).optional(),
  mobileNumber: z.string().min(10).max(15).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = settingsSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await connectToDatabase();
    const couple = await Couple.findById(session.user.id);
    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    // 1. Password update check
    if (validated.data.newPassword) {
      if (!validated.data.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(
        validated.data.currentPassword,
        couple.passwordHash
      );

      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Current password does not match" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      couple.passwordHash = await bcrypt.hash(validated.data.newPassword, salt);
    }

    // 2. Other settings
    if (typeof validated.data.showWishesPublicly === "boolean") {
      couple.showWishesPublicly = validated.data.showWishesPublicly;
    }
    if (validated.data.partnerOneName) {
      couple.partnerOneName = validated.data.partnerOneName.trim();
    }
    if (validated.data.partnerTwoName) {
      couple.partnerTwoName = validated.data.partnerTwoName.trim();
    }
    if (validated.data.mobileNumber) {
      couple.mobileNumber = validated.data.mobileNumber.trim();
    }

    await couple.save();

    await AuditLog.create({
      event: "SETTINGS_UPDATED",
      actorType: "couple",
      actorId: couple._id.toString(),
      metadata: {
        passwordChanged: Boolean(validated.data.newPassword),
        showWishesPublicly: couple.showWishesPublicly,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully!",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
