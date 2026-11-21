import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelBackButton } from "@/components/ui/PixelBackButton";
import { connectToDatabase } from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import Guest from "@/models/Guest";
import AuditLog from "@/models/AuditLog";
import OTP from "@/models/OTP";

export const metadata = {
  title: "Suspicious Activity Monitor | Admin Portal | The Wedding Wish",
};

export default async function AdminSuspiciousPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  // 1. Find guests with >= 2 failed payment attempts
  const failedTx = await Contribution.aggregate([
    { $match: { paymentStatus: "failed" } },
    {
      $group: {
        _id: "$guestId",
        failedCount: { $sum: 1 },
        totalAmountAttempted: { $sum: "$amount" },
        lastAttempt: { $max: "$createdAt" },
      },
    },
    { $match: { failedCount: { $gte: 2 } } },
    { $sort: { failedCount: -1 } },
  ]);

  const guestIds = failedTx.map((f) => f._id).filter(Boolean);
  const suspiciousGuests = await Guest.find({ _id: { $in: guestIds } }).lean();

  const repeatedFailedGuests = failedTx.map((f) => {
    const guest = suspiciousGuests.find(
      (g) => g._id.toString() === f._id?.toString()
    );
    return {
      id: f._id?.toString() || "unknown",
      name: guest?.fullName || "Unverified Guest",
      mobile: guest?.mobileNumber || "N/A",
      failedCount: f.failedCount as number,
      totalPaise: f.totalAmountAttempted as number,
      lastAttempt: f.lastAttempt as Date,
    };
  });

  // 2. Query security events from AuditLog
  const securityLogs = await AuditLog.find({
    event: {
      $in: [
        "otp_rate_limited",
        "otp_locked",
        "otp_verify_failed",
        "couple_suspended",
        "couple_unsuspended",
        "PAYMENT_FAILED",
      ],
    },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // 3. Active locked OTPs
  const lockedOtps = await OTP.find({
    attempts: { $gte: 5 },
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <AdminNavbar email={session.email} role={session.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Back navigation */}
        <div className="flex items-center">
          <PixelBackButton href="/admin" label="← ADMIN OVERVIEW" />
        </div>

        <div className="border-b-4 border-deep pb-4">
          <div className="inline-block bg-red-700 text-cream font-pixel text-[10px] px-2 py-0.5 uppercase border border-deep">
            SECURITY &amp; FRAUD GUARD
          </div>
          <h1 className="font-pixel text-2xl sm:text-3xl text-deep mt-1">
            SUSPICIOUS ACTIVITY MONITOR
          </h1>
          <p className="font-retro text-xl text-vintage">
            Real-time heuristic anomaly detection for payment surges, brute-force OTPs, and lockouts.
          </p>
        </div>

        {/* Heuristic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PixelCard
            variant="cream"
            className={`border-2 border-deep p-4 ${
              repeatedFailedGuests.length > 0 ? "bg-red-50" : ""
            }`}
          >
            <div className="font-pixel text-[10px] text-vintage">
              HIGH-FAIL PAYMENT SPIKES
            </div>
            <div className="font-pixel text-3xl text-red-700">
              {repeatedFailedGuests.length}
            </div>
            <div className="font-retro text-base text-vintage">
              Guests with ≥2 failed payments
            </div>
          </PixelCard>

          <PixelCard
            variant="cream"
            className={`border-2 border-deep p-4 ${
              lockedOtps.length > 0 ? "bg-amber-50" : ""
            }`}
          >
            <div className="font-pixel text-[10px] text-vintage">
              ACTIVE OTP LOCKOUTS
            </div>
            <div className="font-pixel text-3xl text-amber-800">
              {lockedOtps.length}
            </div>
            <div className="font-retro text-base text-vintage">
              Max wrong attempts exceeded
            </div>
          </PixelCard>

          <PixelCard variant="cream" className="border-2 border-deep p-4">
            <div className="font-pixel text-[10px] text-vintage">
              SECURITY AUDIT EVENTS
            </div>
            <div className="font-pixel text-3xl text-deep">
              {securityLogs.length}
            </div>
            <div className="font-retro text-base text-vintage">
              Recent recorded incidents
            </div>
          </PixelCard>
        </div>

        {/* Section 1: Repeated Failed Payments */}
        <div className="space-y-4">
          <h2 className="font-pixel text-sm text-deep flex items-center gap-2">
            <span>⚠</span> REPEATED PAYMENT FAILURES
          </h2>

          {repeatedFailedGuests.length === 0 ? (
            <PixelCard variant="cream" className="border-2 border-deep p-6 text-center">
              <span className="font-retro text-xl text-vintage">
                ✅ No repeated payment failures detected. All transactions healthy.
              </span>
            </PixelCard>
          ) : (
            <div className="overflow-x-auto border-4 border-deep bg-cream">
              <table className="w-full text-left font-retro text-lg">
                <thead className="bg-red-100 border-b-2 border-deep font-pixel text-[10px] text-red-900">
                  <tr>
                    <th className="p-3">GUEST NAME</th>
                    <th className="p-3">MOBILE NUMBER</th>
                    <th className="p-3">FAILED ATTEMPTS</th>
                    <th className="p-3">TOTAL VALUE</th>
                    <th className="p-3">LAST ATTEMPT</th>
                    <th className="p-3">RISK LEVEL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep/15">
                  {repeatedFailedGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-red-50/50">
                      <td className="p-3 font-bold text-deep">{g.name}</td>
                      <td className="p-3 font-mono text-sm text-deep">{g.mobile}</td>
                      <td className="p-3 font-pixel text-xs text-red-700">
                        {g.failedCount} failures
                      </td>
                      <td className="p-3 font-bold text-deep">
                        ₹{(g.totalPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-vintage">
                        {new Date(g.lastAttempt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        <PixelBadge variant="archived" size="sm">
                          HIGH RISK
                        </PixelBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Security Audit Trail */}
        <div className="space-y-4">
          <h2 className="font-pixel text-sm text-deep flex items-center gap-2">
            <span>🛡</span> RECENT SECURITY &amp; OTP AUDIT LOGS
          </h2>

          {securityLogs.length === 0 ? (
            <PixelCard variant="cream" className="border-2 border-deep p-6 text-center">
              <span className="font-retro text-xl text-vintage">
                ✅ No suspicious rate limits or lockouts recorded.
              </span>
            </PixelCard>
          ) : (
            <div className="overflow-x-auto border-4 border-deep bg-cream">
              <table className="w-full text-left font-retro text-lg">
                <thead className="bg-soft-blush border-b-2 border-deep font-pixel text-[10px] text-deep">
                  <tr>
                    <th className="p-3">TIMESTAMP</th>
                    <th className="p-3">ACTOR</th>
                    <th className="p-3">EVENT</th>
                    <th className="p-3">METADATA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep/15">
                  {securityLogs.map((log) => (
                    <tr key={log._id.toString()} className="hover:bg-soft-blush/40">
                      <td className="p-3 text-vintage text-base">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-bold text-deep">
                        {log.actorType}:{log.actorId || "system"}
                      </td>
                      <td className="p-3 font-pixel text-xs text-vintage">
                        {log.event}
                      </td>
                      <td className="p-3 font-mono text-xs text-deep max-w-xs truncate">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
