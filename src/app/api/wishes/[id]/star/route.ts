import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wish from "@/models/Wish";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const wish = await Wish.findOne({ _id: id, coupleId: session.user.id });
    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    wish.starred = !wish.starred;
    await wish.save();

    return NextResponse.json({ success: true, starred: wish.starred });
  } catch (error) {
    console.error("Wish star error:", error);
    return NextResponse.json(
      { error: "Failed to toggle star" },
      { status: 500 }
    );
  }
}
