import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";
import AuditLog from "@/models/AuditLog";
import { getAdminSession } from "@/lib/admin-auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const couple = await Couple.findById(id);
    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    couple.isSuspended = !couple.isSuspended;
    await couple.save();

    await AuditLog.create({
      event: couple.isSuspended ? "couple_suspended" : "couple_unsuspended",
      actorType: "admin" as const,
      actorId: session.adminId,
      refId: couple._id.toString(),
      metadata: {
        coupleId: couple._id.toString(),
        weddingCode: couple.weddingCode,
        adminEmail: session.email,
        ip: req.headers.get("x-forwarded-for") || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      isSuspended: couple.isSuspended,
      message: `Couple ${couple.isSuspended ? "suspended" : "reactivated"} successfully.`,
    });
  } catch (error) {
    console.error("Error toggling couple status:", error);
    return NextResponse.json(
      { error: "Failed to update couple status." },
      { status: 500 }
    );
  }
}
