import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await Couple.findByIdAndUpdate(session.user.id, {
      $set: { justCompletedGoalIds: [] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear celebration error:", error);
    return NextResponse.json(
      { error: "Failed to clear celebration" },
      { status: 500 }
    );
  }
}
