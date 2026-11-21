import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import { generateBudgetPlan } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`ai-budget:${session.user.id}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rateLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();
    const goals = await Goal.find({
      coupleId: session.user.id,
      status: { $in: ["active", "completed"] },
    })
      .select("title category targetAmount")
      .lean();

    const plan = await generateBudgetPlan({
      coupleNames: `${session.user.partnerOneName} & ${session.user.partnerTwoName}`,
      goals: goals.map((g) => ({
        title: g.title,
        category: g.category,
        targetAmountPaise: g.targetAmount,
      })),
    });

    await AuditLog.create({
      event: "AI_BUDGET_PLAN_GENERATED",
      actorType: "couple",
      actorId: session.user.id,
      metadata: {
        totalEstimatedRupees: plan.totalEstimatedRupees,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("AI Budget Plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate budget plan" },
      { status: 500 }
    );
  }
}
