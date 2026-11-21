import mongoose, { Schema, Model } from "mongoose";
import { IGoal } from "@/types";

const GoalSchema = new Schema<IGoal>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: "Couple",
      required: [true, "Couple ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Goal description is required"],
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["Travel", "Home", "Kitchen", "Furniture", "Experience", "Other"],
      required: [true, "Category is required"],
      default: "Other",
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [10000, "Minimum target amount is ₹100 (10,000 paise)"],
    },
    collectedAmount: {
      type: Number,
      default: 0,
      min: [0, "Collected amount cannot be negative"],
    },
    image: {
      type: String,
      default: "heart",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      index: true,
    },
    isSpotlight: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for sorting within couple's list
GoalSchema.index({ coupleId: 1, order: 1 });

export const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
