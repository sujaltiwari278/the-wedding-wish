import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds must be an array of IDs" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update each goal's order safely ensuring couple ownership
    const bulkOps = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id, coupleId: session.user.id },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await Goal.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Goals reordered" });
  } catch (error) {
    console.error("Goals reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder goals" }, { status: 500 });
  }
}
