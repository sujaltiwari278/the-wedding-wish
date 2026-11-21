import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import Wish from "@/models/Wish";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const coupleObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Fetch active goals count and list
    const goals = await Goal.find({ coupleId: coupleObjectId })
      .sort({ order: 1 })
      .lean();

    const activeGoalsCount = goals.filter((g) => g.status === "active").length;

    // Aggregate verified successful contributions
    const contributionAgg = await Contribution.aggregate([
      {
        $match: {
          coupleId: coupleObjectId,
          paymentStatus: "successful",
        },
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$amount" },
          count: { $sum: 1 },
          uniqueGuests: { $addToSet: "$guestId" },
        },
      },
    ]);

    const totalCollectedPaise = contributionAgg[0]?.totalCollected || 0;
    const successfulContributions = contributionAgg[0]?.count || 0;
    const uniqueContributors = contributionAgg[0]?.uniqueGuests?.length || 0;

    // Recent contributions (empty in Phase 1)
    const recentContributions = await Contribution.find({
      coupleId: coupleObjectId,
      paymentStatus: "successful",
    })
      .sort({ paidAt: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // Recent wishes (empty in Phase 1)
    const recentWishes = await Wish.find({ coupleId: coupleObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      metrics: {
        totalCollectedPaise,
        successfulContributions,
        uniqueContributors,
        activeGoalsCount,
      },
      goals,
      recentContributions,
      recentWishes,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
