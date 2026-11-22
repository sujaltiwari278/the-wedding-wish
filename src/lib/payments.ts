import crypto from "crypto";
import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Goal from "@/models/Goal";
import Wish from "@/models/Wish";
import AuditLog from "@/models/AuditLog";
import { IContribution } from "@/types";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_placeholder";

const isTestPlaceholder =
  !RAZORPAY_KEY_ID ||
  RAZORPAY_KEY_ID.includes("placeholder") ||
  !RAZORPAY_KEY_SECRET ||
  RAZORPAY_KEY_SECRET.includes("placeholder");

/**
 * Simulated (fake) payments are ONLY allowed when:
 *  - running outside production (local dev), OR
 *  - ALLOW_PAYMENT_SIMULATION=true is explicitly set (demo deployments).
 * On a real production site with no Razorpay keys, payments are refused
 * instead of silently accepting fake signatures.
 */
const allowSimulation =
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_PAYMENT_SIMULATION === "true";

let razorpayClient: Razorpay | null = null;
if (!isTestPlaceholder) {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

/**
 * Creates an order on Razorpay (or a simulated test order if placeholder keys
 * and simulation is allowed)
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  if (razorpayClient && !isTestPlaceholder) {
    const order = await razorpayClient.orders.create({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });
    return {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    };
  }

  if (!allowSimulation) {
    throw new Error("Payments are not configured");
  }

  // Realistic Test Simulator order when placeholder keys are active
  const simulatedOrderId = `order_test_${crypto.randomBytes(8).toString("hex")}`;
  return {
    orderId: simulatedOrderId,
    amount: params.amountPaise,
    currency: "INR",
    keyId: RAZORPAY_KEY_ID,
  };
}

/**
 * Verifies Razorpay checkout signature: HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (isTestPlaceholder) {
    // Simulated test mode: only accepted when simulation is explicitly allowed
    return allowSimulation && Boolean(signature && signature.length >= 8);
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * Fetches payment details from Razorpay API to confirm capture status and amount
 */
export async function fetchPaymentFromRazorpay(paymentId: string): Promise<{
  captured: boolean;
  amount: number;
}> {
  if (razorpayClient && !isTestPlaceholder) {
    const payment = await razorpayClient.payments.fetch(paymentId);
    return {
      captured: payment.status === "captured",
      amount: payment.amount as number,
    };
  }

  if (!allowSimulation) {
    throw new Error("Payments are not configured");
  }

  // Simulated test payment
  return {
    captured: true,
    amount: 0, // In simulation mode, verified by stored contribution
  };
}

/**
 * Validates Razorpay Webhook Signature on RAW body
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (isTestPlaceholder) {
    // Never trust webhooks in production without real keys
    return allowSimulation;
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * UNIFIED IDEMPOTENT FINALISATION
 * Both client verify route and server webhook call this function.
 * It atomically transitions paymentStatus from 'created'/'pending' -> 'successful'.
 * Double calls, replayed webhooks, or concurrent calls are completely idempotent.
 */
export async function finaliseContribution(
  orderId: string,
  paymentDetails?: {
    paymentId?: string;
    signature?: string;
  }
): Promise<{ success: boolean; contribution: IContribution | null; alreadyFinalised: boolean }> {
  await connectToDatabase();

  // 1. Atomic status transition guard
  const contribution = await Contribution.findOneAndUpdate(
    {
      "paymentGatewayReference.razorpayOrderId": orderId,
      paymentStatus: { $ne: "successful" },
    },
    {
      $set: {
        paymentStatus: "successful",
        paidAt: new Date(),
        ...(paymentDetails?.paymentId && {
          "paymentGatewayReference.razorpayPaymentId": paymentDetails.paymentId,
        }),
        ...(paymentDetails?.signature && {
          "paymentGatewayReference.razorpaySignature": paymentDetails.signature,
        }),
      },
    },
    { new: true }
  );

  // If already finalised or not found
  if (!contribution) {
    const existing = await Contribution.findOne({
      "paymentGatewayReference.razorpayOrderId": orderId,
    });
    if (existing && existing.paymentStatus === "successful") {
      return { success: true, contribution: existing, alreadyFinalised: true };
    }
    return { success: false, contribution: null, alreadyFinalised: false };
  }

  // 2. Safely increment goal collectedAmount
  const updatedGoal = await Goal.findByIdAndUpdate(
    contribution.goalId,
    {
      $inc: { collectedAmount: contribution.amount },
    },
    { new: true }
  );

  // 3. Auto-mark goal completed if target reached
  if (
    updatedGoal &&
    updatedGoal.status === "active" &&
    updatedGoal.collectedAmount >= updatedGoal.targetAmount
  ) {
    updatedGoal.status = "completed";
    updatedGoal.completedAt = new Date();
    await updatedGoal.save();

    // Hook celebration flag on Couple
    const Couple = (await import("@/models/Couple")).default;
    await Couple.findByIdAndUpdate(contribution.coupleId, {
      $addToSet: { justCompletedGoalIds: updatedGoal._id.toString() },
    });

    await AuditLog.create({
      event: "GOAL_FULLY_FUNDED",
      actorType: "system",
      actorId: contribution.coupleId.toString(),
      refId: updatedGoal._id.toString(),
      metadata: {
        title: updatedGoal.title,
        collectedAmount: updatedGoal.collectedAmount,
      },
    });
  }

  // 4. Create Wish record if guest message provided
  if (contribution.guestMessage && contribution.guestMessage.trim().length > 0) {
    await Wish.create({
      coupleId: contribution.coupleId,
      guestId: contribution.guestId,
      contributionId: contribution._id,
      message: contribution.guestMessage.trim(),
      starred: false,
    });
  }

  // 5. Write financial AuditLog entry
  await AuditLog.create({
    event: "PAYMENT_CAPTURED",
    actorType: "guest",
    actorId: contribution.guestId.toString(),
    refId: contribution.transactionId,
    metadata: {
      amount: contribution.amount,
      orderId,
      paymentId: paymentDetails?.paymentId,
      goalId: contribution.goalId.toString(),
    },
  });

  return { success: true, contribution, alreadyFinalised: false };
}

/**
 * Records failed payment attempt idempotently
 */
export async function recordFailedPayment(
  orderId: string,
  errorDetails?: Record<string, unknown>
): Promise<void> {
  await connectToDatabase();

  const failedContribution = await Contribution.findOneAndUpdate(
    {
      "paymentGatewayReference.razorpayOrderId": orderId,
      paymentStatus: { $ne: "successful" }, // Don't overwrite if it was already marked successful
    },
    {
      $set: {
        paymentStatus: "failed",
      },
    },
    { new: true }
  );

  if (failedContribution) {
    await AuditLog.create({
      event: "PAYMENT_FAILED",
      actorType: "guest",
      actorId: failedContribution.guestId.toString(),
      refId: failedContribution.transactionId,
      metadata: {
        orderId,
        errorDetails,
      },
    });
  }
}