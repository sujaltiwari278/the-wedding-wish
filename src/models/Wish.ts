import mongoose, { Schema, Model } from "mongoose";
import { IWish } from "@/types";
import "@/models/Guest";
import "@/models/Goal";

const WishSchema = new Schema<IWish>(
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
    contributionId: {
      type: Schema.Types.ObjectId,
      ref: "Contribution",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

WishSchema.index({ coupleId: 1, createdAt: -1 });

export const Wish: Model<IWish> =
  mongoose.models.Wish || mongoose.model<IWish>("Wish", WishSchema);

export default Wish;
