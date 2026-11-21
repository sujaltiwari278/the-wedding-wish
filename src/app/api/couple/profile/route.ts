import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  partnerOneName: z.string().min(2).max(50),
  partnerTwoName: z.string().min(2).max(50),
  weddingDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  weddingDescription: z.string().max(200, "Intro message cannot exceed 200 characters"),
  coupleStory: z.string().max(2000, "Story cannot exceed 2,000 characters").optional(),
  profileImage: z.string().optional(),
  showWishesPublicly: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const couple = await Couple.findById(session.user.id).lean();

    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    return NextResponse.json({
      couple: {
        id: couple._id.toString(),
        partnerOneName: couple.partnerOneName,
        partnerTwoName: couple.partnerTwoName,
        email: couple.email,
        mobileNumber: couple.mobileNumber,
        weddingDate: couple.weddingDate,
        weddingCode: couple.weddingCode,
        profileSlug: couple.profileSlug,
        weddingDescription: couple.weddingDescription,
        coupleStory: couple.coupleStory || "",
        profileImage: couple.profileImage || "avatar-couple-1",
        showWishesPublicly: couple.showWishesPublicly ?? true,
      },
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await Couple.findByIdAndUpdate(
      session.user.id,
      {
        partnerOneName: validated.data.partnerOneName.trim(),
        partnerTwoName: validated.data.partnerTwoName.trim(),
        weddingDate: new Date(validated.data.weddingDate),
        weddingDescription: validated.data.weddingDescription.trim(),
        coupleStory: validated.data.coupleStory?.trim() || "",
        profileImage: validated.data.profileImage || "avatar-couple-1",
        showWishesPublicly: validated.data.showWishesPublicly ?? true,
      },
      { new: true }
    );

    await AuditLog.create({
      event: "PROFILE_UPDATED",
      actorType: "couple",
      actorId: session.user.id,
      refId: updated?.weddingCode,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      couple: updated,
    });
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
