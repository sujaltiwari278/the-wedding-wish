import mongoose, { Schema, Model } from "mongoose";
import { IGuest } from "@/types";

const GuestSchema = new Schema<IGuest>(
  {
    // Guests are created right after OTP verification, BEFORE the
    // "tell us about you" step, so fullName must be allowed to be empty.
    // The PATCH /api/guest/profile route enforces a real name (min 2 chars).
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    relationship: {
      type: String,
      trim: true,
      enum: ["Family", "Friend", "Colleague", "Neighbour", "Other", ""],
      default: "Other",
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

GuestSchema.index({ createdAt: -1 });

// In development, drop any cached model so schema changes always apply
if (process.env.NODE_ENV !== "production" && mongoose.models.Guest) {
  delete mongoose.models.Guest;
}

export const Guest: Model<IGuest> =
  mongoose.models.Guest || mongoose.model<IGuest>("Guest", GuestSchema);

// Diagnostic: should print "fullName required: false"
console.log("Guest model loaded. fullName required:", GuestSchema.path("fullName").isRequired);

export default Guest;