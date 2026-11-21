import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import AuditLog from "@/models/AuditLog";

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

    const contribution = await Contribution.findOneAndUpdate(
      { _id: id, coupleId: session.user.id },
      { $set: { thankYouSent: true } },
      { new: true }
    );

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution not found or unauthorized" },
        { status: 404 }
      );
    }

    await AuditLog.create({
      event: "THANKYOU_SENT",
      actorType: "couple",
      actorId: session.user.id,
      refId: contribution.transactionId,
    });

    return NextResponse.json({ success: true, contribution });
  } catch (error) {
    console.error("Mark thank you error:", error);
    return NextResponse.json(
      { error: "Failed to update thank you status" },
      { status: 500 }
    );
  }
}
