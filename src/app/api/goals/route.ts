import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import AuditLog from "@/models/AuditLog";
import { rupeesToPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

const goalCreateSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().min(2, "Description is required").max(500),
  category: z.enum(["Travel", "Home", "Kitchen", "Furniture", "Experience", "Other"]),
  targetRupees: z.number().min(100, "Minimum target amount is ₹100"),
  image: z.string().default("heart"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const goals = await Goal.find({ coupleId: session.user.id })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Goals GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if seeding example goals was requested
    if (body.action === "seed_examples") {
      await connectToDatabase();

      const existingCount = await Goal.countDocuments({ coupleId: session.user.id });

      const sampleGoals = [
        {
          coupleId: session.user.id,
          title: "Europe Honeymoon",
          description: "Wandering through ancient alleys, historic cafes, and scenic Swiss peaks.",
          category: "Travel",
          targetAmount: rupeesToPaise(150000), // ₹1,50,000 -> 15,000,000 paise
          collectedAmount: 0,
          image: "plane",
          status: "active",
          order: existingCount,
        },
        {
          coupleId: session.user.id,
          title: "Our First Home",
          description: "Helping us lay the foundation for our very first home sweet home.",
          category: "Home",
          targetAmount: rupeesToPaise(100000), // ₹1,00,000 -> 10,000,000 paise
          collectedAmount: 0,
          image: "house",
          status: "active",
          order: existingCount + 1,
        },
        {
          coupleId: session.user.id,
          title: "Dream Kitchen",
          description: "Espresso machine, copper cookware, and Sunday breakfast essentials.",
          category: "Kitchen",
          targetAmount: rupeesToPaise(40000), // ₹40,000 -> 4,000,000 paise
          collectedAmount: 0,
          image: "kitchen",
          status: "active",
          order: existingCount + 2,
        },
        {
          coupleId: session.user.id,
          title: "Furniture & Interiors",
          description: "A cozy modular sofa and a handcrafted dining table for family dinners.",
          category: "Furniture",
          targetAmount: rupeesToPaise(50000), // ₹50,000 -> 5,000,000 paise
          collectedAmount: 0,
          image: "sofa",
          status: "active",
          order: existingCount + 3,
        },
      ];

      await Goal.insertMany(sampleGoals);

      await AuditLog.create({
        event: "EXAMPLE_GOALS_SEEDED",
        actorType: "couple",
        actorId: session.user.id,
      });

      const updatedGoals = await Goal.find({ coupleId: session.user.id })
        .sort({ order: 1 })
        .lean();

      return NextResponse.json({
        success: true,
        message: "Loaded 4 example wedding dreams!",
        goals: updatedGoals,
      });
    }

    // Normal goal creation
    const validated = goalCreateSchema.safeParse(body);
    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await connectToDatabase();

    const maxOrderGoal = await Goal.findOne({ coupleId: session.user.id })
      .sort({ order: -1 })
      .select("order")
      .lean();

    const nextOrder = maxOrderGoal ? (maxOrderGoal.order ?? 0) + 1 : 0;
    const targetAmountPaise = rupeesToPaise(validated.data.targetRupees);

    const newGoal = await Goal.create({
      coupleId: session.user.id,
      title: validated.data.title.trim(),
      description: validated.data.description.trim(),
      category: validated.data.category,
      targetAmount: targetAmountPaise,
      collectedAmount: 0,
      image: validated.data.image,
      status: "active",
      order: nextOrder,
    });

    await AuditLog.create({
      event: "GOAL_CREATED",
      actorType: "couple",
      actorId: session.user.id,
      refId: newGoal._id.toString(),
      metadata: { title: newGoal.title, targetAmount: newGoal.targetAmount },
    });

    return NextResponse.json(
      { success: true, goal: newGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Goals POST Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
