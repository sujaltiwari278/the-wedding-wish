import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import AuditLog from "@/models/AuditLog";
import { rupeesToPaise } from "@/lib/money";

const updateGoalSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(500).optional(),
  category: z
    .enum(["Travel", "Home", "Kitchen", "Furniture", "Experience", "Other"])
    .optional(),
  targetRupees: z.number().min(100).optional(),
  image: z.string().optional(),
  isSpotlight: z.boolean().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const validated = updateGoalSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership
    const goal = await Goal.findOne({
      _id: id,
      coupleId: session.user.id,
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or does not belong to your realm" },
        { status: 404 }
      );
    }

    if (validated.data.title) goal.title = validated.data.title.trim();
    if (validated.data.description)
      goal.description = validated.data.description.trim();
    if (validated.data.category) goal.category = validated.data.category;
    if (typeof validated.data.targetRupees === "number") {
      goal.targetAmount = rupeesToPaise(validated.data.targetRupees);
    }
    if (validated.data.image) goal.image = validated.data.image;
    if (typeof validated.data.isSpotlight === "boolean") {
      goal.isSpotlight = validated.data.isSpotlight;
    }
    if (validated.data.status) goal.status = validated.data.status;

    await goal.save();

    await AuditLog.create({
      event: "GOAL_UPDATED",
      actorType: "couple",
      actorId: session.user.id,
      refId: id,
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Goal PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    // Strictly check ownership
    const deleted = await Goal.findOneAndDelete({
      _id: id,
      coupleId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized to delete" },
        { status: 404 }
      );
    }

    await AuditLog.create({
      event: "GOAL_DELETED",
      actorType: "couple",
      actorId: session.user.id,
      refId: id,
      metadata: { title: deleted.title },
    });

    return NextResponse.json({
      success: true,
      message: "Goal successfully removed from realm",
    });
  } catch (error) {
    console.error("Goal DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
