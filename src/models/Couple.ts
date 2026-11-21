import mongoose, { Schema, Model } from "mongoose";
import { ICouple } from "@/types";

const CoupleSchema = new Schema<ICouple>(
  {
    partnerOneName: {
      type: String,
      required: [true, "Partner 1 name is required"],
      trim: true,
    },
    partnerTwoName: {
      type: String,
      required: [true, "Partner 2 name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    weddingDate: {
      type: Date,
      required: [true, "Wedding date is required"],
    },
    profileImage: {
      type: String,
      default: "avatar-couple-1",
    },
    weddingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    profileSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    weddingDescription: {
      type: String,
      maxlength: 300,
      default:
        "Your blessings are our biggest gift. Help us turn our little dreams into beautiful memories.",
    },
    coupleStory: {
      type: String,
      default: "",
    },
    showWishesPublicly: {
      type: Boolean,
      default: true,
    },
    justCompletedGoalIds: {
      type: [String],
      default: [],
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    secondaryPartner: {
      email: { type: String, lowercase: true, trim: true },
      mobileNumber: { type: String, trim: true },
      passwordHash: { type: String },
      verified: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const Couple: Model<ICouple> =
  mongoose.models.Couple || mongoose.model<ICouple>("Couple", CoupleSchema);

export default Couple;
