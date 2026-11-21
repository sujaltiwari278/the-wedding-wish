import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { generateGoalSuggestions } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const inputSchema = z.object({
  totalBudgetRupees: z.number().min(1000, "Please enter an approximate budget (min ₹1,000)"),
  interests: z.string().max(200).optional(),
  travelDestinations: z.string().max(200).optional(),
  futurePlans: z.string().max(200).optional(),
  householdNeeds: z.string().max(200).optional(),
  lifestyle: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit per couple: max 10 requests / 5 minutes
    const rateLimit = checkRateLimit(`ai-goals:${session.user.id}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `AI generation limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before requesting more suggestions.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = inputSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const result = await generateGoalSuggestions({
      ...validated.data,
      partnerNames: `${session.user.partnerOneName} & ${session.user.partnerTwoName}`,
    });

    await connectToDatabase();
    await AuditLog.create({
      event: "AI_GOALS_GENERATED",
      actorType: "couple",
      actorId: session.user.id,
      metadata: {
        budget: validated.data.totalBudgetRupees,
        suggestionCount: result.suggestions.length,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Goal Assistant error:", error);
    return NextResponse.json(
      { error: "Failed to generate goal suggestions" },
      { status: 500 }
    );
  }
}
