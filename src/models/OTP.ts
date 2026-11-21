import mongoose, { Schema, Model } from "mongoose";
import { IOTP } from "@/types";

const OTPSchema = new Schema<IOTP>(
  {
    mobileNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    hashedOTP: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL deletion
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Query index for fetching the latest active OTP for a mobile
OTPSchema.index({ mobileNumber: 1, expiresAt: -1 });

export const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
