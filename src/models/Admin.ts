import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: "superadmin" | "moderator";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "moderator"],
      default: "superadmin",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
