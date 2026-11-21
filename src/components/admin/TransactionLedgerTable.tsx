"use client";

import React, { useState } from "react";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelModal } from "@/components/ui/PixelModal";
import { formatIndianRupees } from "@/lib/money";
import { sound } from "@/lib/sound";

export interface TransactionItem {
  id: string;
  transactionId: string;
  amountPaise: number;
  paymentStatus: "successful" | "failed" | "pending" | "refunded";
  createdAt: string;
  coupleName: string;
  weddingCode: string;
  goalTitle: string;
  guestName: string;
  guestMobile: string;
  guestEmail?: string;
  wishMessage?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

interface TransactionLedgerTableProps {
  initialTransactions: TransactionItem[];
}

export function TransactionLedgerTable({
  initialTransactions,
}: TransactionLedgerTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const filteredTransactions = initialTransactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchesSearch =
      tx.transactionId.toLowerCase().includes(q) ||
      tx.guestName.toLowerCase().includes(q) ||
      tx.guestMobile.includes(q) ||
      tx.coupleName.toLowerCase().includes(q) ||
      tx.goalTitle.toLowerCase().includes(q) ||
      (tx.razorpayPaymentId && tx.razorpayPaymentId.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && tx.paymentStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <PixelInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search TX ID, guest, mobile, order..."
            className="bg-cream font-retro text-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="font-pixel text-[10px] text-vintage">STATUS:</span>
          {(["all", "successful", "failed", "pending", "refunded"] as const).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => {
                  sound.playClickBeep();
                  setStatusFilter(filter);
                }}
                className={`font-pixel text-[10px] px-2.5 py-1 border-2 border-deep uppercase ${
                  statusFilter === filter
                    ? "bg-vintage text-cream"
                    : "bg-cream text-deep hover:bg-soft-blush"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-6 text-center text-vintage font-retro text-xl bg-cream border-4 border-deep">
            No transactions match search criteria.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-cream border-4 border-deep p-4 space-y-3 shadow-pixel-sm"
            >
              <div className="flex items-start justify-between gap-2 border-b-2 border-deep/15 pb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-deep block select-all">
                    {tx.transactionId}
                  </span>
                  <span className="font-retro text-sm text-vintage">
                    {new Date(tx.createdAt).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <PixelBadge
                  variant={
                    tx.paymentStatus === "successful"
                      ? "active"
                      : tx.paymentStatus === "failed"
                      ? "archived"
                      : "pending"
                  }
                  size="sm"
                >
                  {tx.paymentStatus.toUpperCase()}
                </PixelBadge>
              </div>

              <div className="grid grid-cols-2 gap-2 font-retro text-base">
                <div>
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    GUEST
                  </span>
                  <span className="font-bold text-deep">{tx.guestName}</span>
                  <span className="font-mono text-xs text-vintage block">{tx.guestMobile}</span>
                </div>
                <div>
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    AMOUNT
                  </span>
                  <span className="font-pixel text-xs text-deep font-bold">
                    {formatIndianRupees(tx.amountPaise)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    COUPLE / GOAL
                  </span>
                  <span className="text-deep font-bold">{tx.coupleName}</span>
                  <span className="text-vintage text-sm block">Goal: {tx.goalTitle}</span>
                </div>
              </div>

              <div className="border-t border-deep/15 pt-2 text-right">
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    sound.playClickBeep();
                    setSelectedTx(tx);
                  }}
                  className="w-full sm:w-auto text-[10px]"
                >
                  VIEW FULL AUDIT ✦
                </PixelButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Ledger Table */}
      <div className="hidden lg:block overflow-x-auto border-4 border-deep bg-cream">
        <table className="w-full text-left font-retro text-lg">
          <thead className="bg-soft-blush border-b-2 border-deep font-pixel text-[10px] text-deep">
            <tr>
              <th className="p-3">TRANSACTION ID</th>
              <th className="p-3">GUEST &amp; MOBILE</th>
              <th className="p-3">COUPLE / GOAL</th>
              <th className="p-3">SHAGUN AMOUNT</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">TIMESTAMP</th>
              <th className="p-3 text-right">DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-deep/15">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-vintage font-retro text-xl">
                  No transactions match search criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-soft-blush/40 transition-colors">
                  <td className="p-3 font-mono text-xs text-deep font-bold">
                    {tx.transactionId}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-deep">{tx.guestName}</div>
                    <div className="font-retro text-sm text-vintage">{tx.guestMobile}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-deep">{tx.coupleName}</div>
                    <div className="font-retro text-sm text-vintage">{tx.goalTitle}</div>
                  </td>
                  <td className="p-3 font-bold text-deep text-xl">
                    {formatIndianRupees(tx.amountPaise)}
                  </td>
                  <td className="p-3">
                    <PixelBadge
                      variant={
                        tx.paymentStatus === "successful"
                          ? "active"
                          : tx.paymentStatus === "failed"
                          ? "archived"
                          : "pending"
                      }
                      size="sm"
                    >
                      {tx.paymentStatus.toUpperCase()}
                    </PixelBadge>
                  </td>
                  <td className="p-3 text-vintage text-base">
                    {new Date(tx.createdAt).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-3 text-right">
                    <PixelButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        sound.playClickBeep();
                        setSelectedTx(tx);
                      }}
                      className="text-[9px]"
                    >
                      VIEW
                    </PixelButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <PixelModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="TRANSACTION AUDIT LEDGER"
        >
          <div className="space-y-4 p-2 text-deep font-retro text-xl">
            <div className="p-3 bg-soft-blush border-2 border-deep space-y-1">
              <div className="font-pixel text-[10px] text-vintage">INTERNAL REFERENCE</div>
              <div className="font-mono text-sm font-bold text-deep">
                {selectedTx.transactionId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-lg">
              <div>
                <span className="font-pixel text-[10px] text-vintage block">AMOUNT</span>
                <span className="font-bold text-2xl text-deep">
                  {formatIndianRupees(selectedTx.amountPaise)}
                </span>
              </div>
              <div>
                <span className="font-pixel text-[10px] text-vintage block">STATUS</span>
                <PixelBadge
                  variant={
                    selectedTx.paymentStatus === "successful" ? "active" : "archived"
                  }
                  size="sm"
                >
                  {selectedTx.paymentStatus.toUpperCase()}
                </PixelBadge>
              </div>
            </div>

            <div className="border-t border-deep/20 pt-2 space-y-2">
              <div>
                <span className="font-pixel text-[10px] text-vintage block">GUEST DETAILS</span>
                <div>
                  <strong>{selectedTx.guestName}</strong> ({selectedTx.guestMobile})
                  {selectedTx.guestEmail && (
                    <span className="text-vintage block text-base">
                      {selectedTx.guestEmail}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-pixel text-[10px] text-vintage block">DESTINATION</span>
                <div>
                  Couple: <strong>{selectedTx.coupleName}</strong> (Code:{" "}
                  {selectedTx.weddingCode})
                </div>
                <div>
                  Goal: <strong>{selectedTx.goalTitle}</strong>
                </div>
              </div>

              {selectedTx.wishMessage && (
                <div>
                  <span className="font-pixel text-[10px] text-vintage block">GUEST WISH</span>
                  <p className="italic bg-cream p-2 border border-deep/30">
                    &ldquo;{selectedTx.wishMessage}&rdquo;
                  </p>
                </div>
              )}

              <div className="border-t border-deep/20 pt-2 font-mono text-xs text-vintage space-y-1">
                <div>RZP Order ID: {selectedTx.razorpayOrderId || "N/A"}</div>
                <div>RZP Payment ID: {selectedTx.razorpayPaymentId || "N/A"}</div>
                <div>Timestamp: {new Date(selectedTx.createdAt).toISOString()}</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <PixelButton
                variant="primary"
                size="md"
                onClick={() => setSelectedTx(null)}
              >
                Close Audit View
              </PixelButton>
            </div>
          </div>
        </PixelModal>
      )}
    </div>
  );
}
