import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { generateThankYouMessage } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const thankYouInputSchema = z.object({
  guestName: z.string().min(1),
  amountRupees: z.number().min(1),
  goalTitle: z.string().min(1),
  guestWish: z.string().optional(),
  tone: z.enum(["Heartfelt", "Funny", "Formal", "Hinglish"]).default("Heartfelt"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`ai-thankyou:${session.user.id}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 20,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rateLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = thankYouInputSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const result = await generateThankYouMessage({
      ...validated.data,
      coupleNames: `${session.user.partnerOneName} & ${session.user.partnerTwoName}`,
    });

    await connectToDatabase();
    await AuditLog.create({
      event: "AI_THANKYOU_GENERATED",
      actorType: "couple",
      actorId: session.user.id,
      metadata: {
        tone: validated.data.tone,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Thank You error:", error);
    return NextResponse.json(
      { error: "Failed to generate thank-you message" },
      { status: 500 }
    );
  }
}
