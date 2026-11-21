import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { generateProfileDescriptions } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const inputSchema = z.object({
  coupleStory: z.string().optional(),
  interests: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`ai-profile:${session.user.id}`, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 15,
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
    const validated = inputSchema.safeParse(body);

    const coupleNames = `${session.user.partnerOneName} & ${session.user.partnerTwoName}`;

    const result = await generateProfileDescriptions({
      coupleNames,
      coupleStory: validated.success ? validated.data.coupleStory : undefined,
      interests: validated.success ? validated.data.interests : undefined,
    });

    await connectToDatabase();
    await AuditLog.create({
      event: "AI_PROFILE_DESC_GENERATED",
      actorType: "couple",
      actorId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI profile description error:", error);
    return NextResponse.json(
      { error: "Failed to generate profile descriptions" },
      { status: 500 }
    );
  }
}
