import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wish from "@/models/Wish";
import Contribution from "@/models/Contribution";
import Goal from "@/models/Goal";
import Guest from "@/models/Guest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const wishes = await Wish.find({ coupleId: session.user.id })
      .populate({ path: "guestId", select: "fullName relationship" })
      .populate({ path: "contributionId", select: "amount goalId" })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch goals for titles
    const goalIds = wishes.map((w) => {
      const c = w.contributionId as unknown as { goalId?: string } | null;
      return c?.goalId;
    }).filter(Boolean);

    const goals = await Goal.find({ _id: { $in: goalIds } }).select("title").lean();
    const goalTitleMap = new Map<string, string>();
    goals.forEach((g) => goalTitleMap.set(g._id.toString(), g.title));

    const formattedWishes = wishes.map((w) => {
      const g = w.guestId as unknown as { fullName?: string; relationship?: string } | null;
      const c = w.contributionId as unknown as { amount?: number; goalId?: string } | null;

      return {
        id: w._id.toString(),
        message: w.message,
        starred: w.starred,
        createdAt: w.createdAt.toISOString(),
        guestName: g?.fullName || "Honoured Guest",
        guestRelationship: g?.relationship || "Well-Wisher",
        amount: c?.amount || 0,
        goalTitle: c?.goalId ? goalTitleMap.get(c.goalId.toString()) || "Wedding Dream" : "Wedding Dream",
      };
    });

    return NextResponse.json({ wishes: formattedWishes });
  } catch (error) {
    console.error("Wishes fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishes" },
      { status: 500 }
    );
  }
}
