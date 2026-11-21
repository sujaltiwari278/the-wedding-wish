import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  finaliseContribution,
  recordFailedPayment,
} from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature header" },
        { status: 400 }
      );
    }

    const isSignatureValid = verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid) {
      console.warn("Invalid Razorpay Webhook Signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await finaliseContribution(orderId, { paymentId });
      }
    } else if (eventType === "order.paid") {
      const orderEntity = event.payload?.order?.entity;
      const orderId = orderEntity?.id;

      if (orderId) {
        await finaliseContribution(orderId);
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        await recordFailedPayment(orderId, paymentEntity?.error_description);
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
