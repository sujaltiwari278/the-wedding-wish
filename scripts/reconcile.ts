import mongoose from "mongoose";
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
const shouldFix = process.argv.includes("--fix");

const GoalSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    collectedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  },
  { timestamps: true }
);

const ContributionSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple" },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
  },
  { timestamps: true }
);

const AuditLogSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: "Couple" },
    actor: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Goal = mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
const Contribution = mongoose.models.Contribution || mongoose.model("Contribution", ContributionSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

async function runReconciliation() {
  console.log("==================================================");
  console.log("🔍 THE WEDDING WISH — LEDGER RECONCILIATION AUDIT");
  console.log(`Mode: ${shouldFix ? "AUTOMATIC HEALING (--fix)" : "READ-ONLY AUDIT"}`);
  console.log("==================================================");

  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("Connected to database.\n");

    const goals = await Goal.find({});
    console.log(`Found ${goals.length} goals in database to reconcile.\n`);

    let discrepanciesFound = 0;
    let totalHealed = 0;

    for (const goal of goals) {
      // Sum all successful contributions for this goal
      const aggregateResult = await Contribution.aggregate([
        {
          $match: {
            goalId: goal._id,
            paymentStatus: "successful",
          },
        },
        {
          $group: {
            _id: "$goalId",
            totalPaise: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const calculatedPaise = aggregateResult.length > 0 ? aggregateResult[0].totalPaise : 0;
      const contributionCount = aggregateResult.length > 0 ? aggregateResult[0].count : 0;
      const currentGoalPaise = goal.collectedAmount || 0;

      if (calculatedPaise !== currentGoalPaise) {
        discrepanciesFound++;
        console.warn(
          `⚠️ DISCREPANCY in Goal: "${goal.title}" (ID: ${goal._id})`
        );
        console.warn(
          `   Recorded:   ₹${(currentGoalPaise / 100).toLocaleString("en-IN")} (${currentGoalPaise} paise)`
        );
        console.warn(
          `   Calculated: ₹${(calculatedPaise / 100).toLocaleString("en-IN")} (${calculatedPaise} paise from ${contributionCount} transactions)`
        );

        if (shouldFix) {
          const oldAmount = goal.collectedAmount;
          goal.collectedAmount = calculatedPaise;
          if (calculatedPaise >= goal.targetAmount && goal.status === "active") {
            goal.status = "completed";
          } else if (calculatedPaise < goal.targetAmount && goal.status === "completed") {
            goal.status = "active";
          }
          await goal.save();

          await AuditLog.create({
            event: "reconcile_heal_goal",
            actorType: "system",
            actorId: goal.coupleId?.toString(),
            refId: goal._id?.toString(),
            metadata: {
              goalTitle: goal.title,
              oldAmountPaise: oldAmount,
              newAmountPaise: calculatedPaise,
              contributionCount,
            },
          });

          console.log(`   ✅ HEALED: Updated to ${calculatedPaise} paise.`);
          totalHealed++;
        }
        console.log("--------------------------------------------------");
      }
    }

    if (discrepanciesFound === 0) {
      console.log("🎉 ALL GOALS RECONCILED CLEANLY! 100% LEDGER INTEGRITY.");
    } else {
      console.log(`\nReconciliation finished: ${discrepanciesFound} discrepancies detected.`);
      if (shouldFix) {
        console.log(`Successfully healed ${totalHealed} goals.`);
      } else {
        console.log("Run with --fix flag to automatically heal discrepancies.");
      }
    }
  } catch (error) {
    console.error("❌ Reconciliation error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runReconciliation();
