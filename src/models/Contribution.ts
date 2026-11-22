import mongoose, { Schema, Model } from "mongoose";
import { IContribution } from "@/types";
import "@/models/Guest";
import "@/models/Goal";

const ContributionSchema = new Schema<IContribution>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      index: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [100, "Minimum contribution is 100 paise (₹1)"],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    paymentGatewayReference: {
      razorpayOrderId: {
        type: String,
        sparse: true,
        index: true,
      },
      razorpayPaymentId: {
        type: String,
        sparse: true,
        index: true,
      },
      razorpaySignature: {
        type: String,
      },
    },
    paymentStatus: {
      type: String,
      enum: ["created", "pending", "successful", "failed"],
      default: "created",
      index: true,
    },
    guestMessage: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    thankYouSent: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast dashboard queries and status lookups
ContributionSchema.index({ coupleId: 1, createdAt: -1 });
ContributionSchema.index({ coupleId: 1, paymentStatus: 1 });
ContributionSchema.index({ goalId: 1, paymentStatus: 1 });
ContributionSchema.index({ guestId: 1, createdAt: -1 });

export const Contribution: Model<IContribution> =
  mongoose.models.Contribution ||
  mongoose.model<IContribution>("Contribution", ContributionSchema);

export default Contribution;
