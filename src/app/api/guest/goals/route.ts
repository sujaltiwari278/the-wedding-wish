import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Couple slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const couple = await Couple.findOne({
      profileSlug: slug.toLowerCase().trim(),
    })
      .select("_id")
      .lean();

    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    const goals = await Goal.find({
      coupleId: couple._id,
      status: { $in: ["active", "completed"] },
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Aggregate contributor counts per goal
    const goalCounts = await Contribution.aggregate([
      {
        $match: {
          coupleId: couple._id,
          paymentStatus: "successful",
        },
      },
      {
        $group: {
          _id: "$goalId",
          uniqueContributors: { $addToSet: "$guestId" },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    goalCounts.forEach((gc) => {
      countMap.set(gc._id.toString(), gc.uniqueContributors.length);
    });

    const goalsWithCounts = goals.map((g) => ({
      ...g,
      contributorCount: countMap.get(g._id.toString()) || 0,
    }));

    return NextResponse.json({ goals: goalsWithCounts });
  } catch (error) {
    console.error("Guest goals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dreams" },
      { status: 500 }
    );
  }
}
