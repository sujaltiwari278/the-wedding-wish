import mongoose, { Schema, Model } from "mongoose";
import { IAuditLog } from "@/types";

const AuditLogSchema = new Schema<IAuditLog>(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    actorType: {
      type: String,
      enum: ["couple", "guest", "admin", "system"],
      required: true,
      index: true,
    },
    actorId: {
      type: String,
      index: true,
    },
    refId: {
      type: String,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ event: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
