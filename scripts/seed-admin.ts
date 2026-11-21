import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/wedding-wish";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@weddingwish.in").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "superadmin" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
  console.log("--------------------------------------------------");
  console.log("🎮 THE WEDDING WISH — ADMIN PROVISIONING SCRIPT");
  console.log("--------------------------------------------------");
  console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("✅ MongoDB connected successfully.");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = "superadmin";
      await existingAdmin.save();
      console.log(`✨ Admin account updated: ${ADMIN_EMAIL}`);
    } else {
      await Admin.create({
        email: ADMIN_EMAIL,
        passwordHash,
        role: "superadmin",
      });
      console.log(`✨ New Superadmin created: ${ADMIN_EMAIL}`);
    }

    console.log("--------------------------------------------------");
    console.log("Admin Credentials:");
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("URL:      http://localhost:3000/admin/login");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedAdmin();
