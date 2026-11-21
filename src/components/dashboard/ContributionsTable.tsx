"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatIndianRupees } from "@/lib/money";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelSelect } from "@/components/ui/PixelInput";
import { ThankYouModal } from "@/components/dashboard/ThankYouModal";

export interface ContributionRow {
  id: string;
  transactionId: string;
  amount: number;
  paymentStatus: "created" | "pending" | "successful" | "failed";
  paidAt?: string;
  createdAt: string;
  guestMessage?: string;
  thankYouSent?: boolean;
  guestName: string;
  guestMobile: string;
  guestRelationship?: string;
  goalTitle: string;
  goalId: string;
}

interface ContributionsTableProps {
  contributions: ContributionRow[];
  goals: { id: string; title: string }[];
}

export function ContributionsTable({
  contributions,
  goals,
}: ContributionsTableProps) {
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [thankYouTarget, setThankYouTarget] = useState<ContributionRow | null>(null);
  const pageSize = 10;

  const filtered = contributions.filter((c) => {
    if (selectedGoal !== "all" && c.goalId !== selectedGoal) return false;
    if (selectedStatus !== "all" && c.paymentStatus !== selectedStatus)
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedContributions = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-cream p-3 border-2 border-deep">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="w-44">
            <PixelSelect
              value={selectedGoal}
              onChange={(e) => {
                setSelectedGoal(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Dreams" },
                ...goals.map((g) => ({ value: g.id, label: g.title })),
              ]}
            />
          </div>

          <div className="w-40">
            <PixelSelect
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "successful", label: "Successful" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "created", label: "Created" },
              ]}
            />
          </div>
        </div>

        <span className="font-retro text-lg text-deep/80 self-end sm:self-center">
          Showing {filtered.length} of {contributions.length} entries
        </span>
      </div>

      {/* Content: Mobile Cards + Desktop Table */}
      {pagedContributions.length === 0 ? (
        <div className="p-8 text-center bg-cream border-2 border-deep font-retro text-xl text-deep/70">
          No shagun contributions match the selected filter.
        </div>
      ) : (
        <>
          {/* Mobile Stacked Cards (Visible on mobile/tablet portrait) */}
          <div className="block md:hidden space-y-3">
            {pagedContributions.map((row) => {
              const statusBadge =
                row.paymentStatus === "successful"
                  ? "active"
                  : row.paymentStatus === "failed"
                  ? "archived"
                  : "neutral";

              return (
                <div
                  key={row.id}
                  className="bg-cream border-2 border-deep p-3 space-y-2.5 shadow-pixel-sm"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-deep/15 pb-2">
                    <div>
                      <span className="font-pixel text-xs text-deep block">
                        {row.guestName || "Honoured Guest"}
                      </span>
                      {row.guestRelationship && (
                        <span className="font-retro text-sm text-vintage block">
                          {row.guestRelationship}
                        </span>
                      )}
                    </div>
                    <PixelBadge variant={statusBadge} size="sm">
                      {row.paymentStatus}
                    </PixelBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-retro text-base">
                    <div>
                      <span className="font-pixel text-[9px] text-vintage uppercase block">
                        DREAM GOAL
                      </span>
                      <span className="font-bold text-deep text-lg">{row.goalTitle}</span>
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-vintage uppercase block">
                        SHAGUN
                      </span>
                      <span className="font-pixel text-xs text-deep font-bold">
                        {formatIndianRupees(row.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-vintage uppercase block">
                        MOBILE (PRIVATE)
                      </span>
                      <span className="font-pixel text-[10px] text-deep select-all">
                        {row.guestMobile}
                      </span>
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-vintage uppercase block">
                        DATE
                      </span>
                      <span className="text-deep/80">
                        {new Date(row.paidAt || row.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {row.guestMessage && (
                    <div className="p-2 bg-soft-blush border border-deep/20 font-retro text-base italic text-deep">
                      &ldquo;{row.guestMessage}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-deep/15 pt-2">
                    <span className="font-pixel text-[9px] text-deep/70 select-all">
                      {row.transactionId}
                    </span>
                    {row.paymentStatus === "successful" && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/payment/confirmation/${row.transactionId}`}
                          target="_blank"
                          className="font-pixel text-[9px] text-vintage hover:underline"
                        >
                          Receipt 🧾
                        </Link>
                        <button
                          onClick={() => setThankYouTarget(row)}
                          className="font-pixel text-[9px] bg-soft-blush border border-deep px-2 py-1 hover:bg-blush text-deep"
                        >
                          {row.thankYouSent ? "Sent 💌" : "Thank 💌"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Visible on md and above) */}
          <div className="hidden md:block overflow-x-auto border-2 border-deep bg-cream shadow-pixel-sm">
            <table className="w-full text-left font-retro text-lg border-collapse">
              <thead>
                <tr className="bg-soft-blush border-b-2 border-deep font-pixel text-[10px] text-deep uppercase tracking-wider">
                  <th className="p-3">Contributor</th>
                  <th className="p-3">Mobile (Private)</th>
                  <th className="p-3">Dream Goal</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Ref &amp; Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep/15">
                {pagedContributions.map((row) => {
                  const statusBadge =
                    row.paymentStatus === "successful"
                      ? "active"
                      : row.paymentStatus === "failed"
                      ? "archived"
                      : "neutral";

                  return (
                    <tr key={row.id} className="hover:bg-soft-blush/40 transition-colors">
                      {/* Contributor */}
                      <td className="p-3">
                        <span className="font-pixel text-xs text-deep block">
                          {row.guestName || "Honoured Guest"}
                        </span>
                        {row.guestRelationship && (
                          <span className="text-sm text-vintage block">
                            {row.guestRelationship}
                          </span>
                        )}
                        {row.guestMessage && (
                          <span className="text-sm text-deep/70 italic line-clamp-1 mt-0.5">
                            &ldquo;{row.guestMessage}&rdquo;
                          </span>
                        )}
                      </td>

                      {/* Mobile Number (Confidential to couple) */}
                      <td className="p-3 font-pixel text-xs text-vintage select-all">
                        {row.guestMobile}
                      </td>

                      {/* Goal */}
                      <td className="p-3">
                        <span className="font-bold">{row.goalTitle}</span>
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-pixel text-xs text-deep font-bold">
                        {formatIndianRupees(row.amount)}
                      </td>

                      {/* Date */}
                      <td className="p-3 text-base">
                        {new Date(row.paidAt || row.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <PixelBadge variant={statusBadge} size="sm">
                          {row.paymentStatus}
                        </PixelBadge>
                      </td>

                      {/* Transaction Ref & Receipt */}
                      <td className="p-3">
                        <span className="font-pixel text-[10px] text-deep/80 block select-all">
                          {row.transactionId}
                        </span>
                        {row.paymentStatus === "successful" && (
                          <div className="flex items-center gap-2 mt-1">
                            <Link
                              href={`/payment/confirmation/${row.transactionId}`}
                              target="_blank"
                              className="font-pixel text-[9px] text-vintage hover:underline"
                            >
                              Receipt 🧾
                            </Link>
                            <button
                              onClick={() => setThankYouTarget(row)}
                              className="font-pixel text-[9px] bg-soft-blush border border-deep px-1.5 py-0.5 hover:bg-blush text-deep"
                            >
                              {row.thankYouSent ? "Sent 💌" : "Thank 💌"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-soft-blush p-3 border-2 border-deep">
          <PixelButton
            size="sm"
            variant="ghost"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            ← Previous
          </PixelButton>

          <span className="font-pixel text-[10px] text-deep">
            PAGE {currentPage} OF {totalPages}
          </span>

          <PixelButton
            size="sm"
            variant="ghost"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next →
          </PixelButton>
        </div>
      )}
      {/* Thank You Generator Modal */}
      <ThankYouModal
        isOpen={!!thankYouTarget}
        onClose={() => setThankYouTarget(null)}
        contribution={
          thankYouTarget
            ? {
                id: thankYouTarget.id,
                guestName: thankYouTarget.guestName,
                guestMobile: thankYouTarget.guestMobile,
                amount: thankYouTarget.amount,
                goalTitle: thankYouTarget.goalTitle,
                guestMessage: thankYouTarget.guestMessage,
                thankYouSent: thankYouTarget.thankYouSent,
              }
            : null
        }
        onMarkSent={(id) => {
          if (thankYouTarget && thankYouTarget.id === id) {
            thankYouTarget.thankYouSent = true;
          }
        }}
      />
    </div>
  );
}
