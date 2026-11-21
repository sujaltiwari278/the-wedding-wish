import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Contribution from "@/models/Contribution";
import { getGuestSession } from "@/lib/guest-session";
import { rupeesToPaise } from "@/lib/money";
import { generateTransactionId } from "@/lib/transactions";
import { createRazorpayOrder } from "@/lib/payments";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  coupleId: z.string().min(1, "Couple ID is required"),
  goalId: z.string().min(1, "Goal ID is required"),
  amountRupees: z
    .number()
    .min(1, "Minimum contribution amount is ₹1")
    .max(500000, "Maximum single contribution is ₹5,00,000"),
  guestMessage: z.string().max(300, "Message cannot exceed 300 characters").optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getGuestSession();
    if (!session?.guestId) {
      return NextResponse.json(
        { error: "Please verify your mobile number to send shagun." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createOrderSchema.safeParse(body);

    if (!validated.success) {
      const msg = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { coupleId, goalId, amountRupees, guestMessage } = validated.data;

    await connectToDatabase();

    // Verify goal exists, belongs to this couple, and is active
    const goal = await Goal.findOne({
      _id: goalId,
      coupleId,
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or does not belong to this couple" },
        { status: 404 }
      );
    }

    if (goal.status !== "active") {
      return NextResponse.json(
        {
          error:
            goal.status === "completed"
              ? "This wedding dream is already fully funded! Please choose another goal."
              : "This goal is currently not accepting contributions.",
        },
        { status: 400 }
      );
    }

    // Convert amount to integer paise server-side
    const amountPaise = rupeesToPaise(amountRupees);
    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Minimum contribution amount is 100 paise (₹1)" },
        { status: 400 }
      );
    }

    // Generate unique internal transaction reference
    const transactionId = generateTransactionId();

    // Create order with payment gateway
    const order = await createRazorpayOrder({
      amountPaise,
      receipt: transactionId,
      notes: {
        goalId: goal._id.toString(),
        goalTitle: goal.title,
        guestId: session.guestId,
        coupleId,
        transactionId,
      },
    });

    // Create initial Contribution record in 'created' state
    const contribution = await Contribution.create({
      coupleId,
      guestId: session.guestId,
      goalId: goal._id,
      amount: amountPaise,
      transactionId,
      paymentGatewayReference: {
        razorpayOrderId: order.orderId,
      },
      paymentStatus: "created",
      guestMessage: guestMessage?.trim() || "",
      thankYouSent: false,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      transactionId: contribution.transactionId,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { error: "Unable to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
