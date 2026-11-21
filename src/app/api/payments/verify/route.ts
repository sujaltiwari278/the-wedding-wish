import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import { getGuestSession } from "@/lib/guest-session";
import {
  verifyRazorpaySignature,
  fetchPaymentFromRazorpay,
  finaliseContribution,
  recordFailedPayment,
} from "@/lib/payments";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getGuestSession();
    if (!session?.guestId) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const validated = verifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      validated.data;

    await connectToDatabase();

    // Verify stored contribution exists and belongs to this guest
    const contribution = await Contribution.findOne({
      "paymentGatewayReference.razorpayOrderId": razorpay_order_id,
      guestId: session.guestId,
    });

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution record not found for this order" },
        { status: 404 }
      );
    }

    // Verify HMAC-SHA256 signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      await recordFailedPayment(razorpay_order_id, {
        reason: "Invalid payment gateway signature",
      });
      return NextResponse.json(
        { error: "Payment verification failed: Signature mismatch" },
        { status: 400 }
      );
    }

    // Verify capture status directly with Razorpay
    const paymentCheck = await fetchPaymentFromRazorpay(razorpay_payment_id);
    if (!paymentCheck.captured) {
      await recordFailedPayment(razorpay_order_id, {
        reason: "Payment not captured by gateway",
      });
      return NextResponse.json(
        { error: "Payment was not successfully captured by the gateway" },
        { status: 400 }
      );
    }

    // Idempotent finalisation (transitions status, increments goal, creates wish & audit)
    const result = await finaliseContribution(razorpay_order_id, {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!result.success || !result.contribution) {
      return NextResponse.json(
        { error: "Failed to finalize contribution" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shagun received and verified successfully!",
      transactionId: result.contribution.transactionId,
      alreadyFinalised: result.alreadyFinalised,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during payment verification" },
      { status: 500 }
    );
  }
}
