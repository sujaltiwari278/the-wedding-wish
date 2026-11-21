"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelInput } from "@/components/ui/PixelInput";
import { formatIndianRupees } from "@/lib/money";
import { sound } from "@/lib/sound";

export interface CoupleItem {
  id: string;
  partnerOneName: string;
  partnerTwoName: string;
  email: string;
  mobileNumber: string;
  weddingCode: string;
  profileSlug: string;
  weddingDate: string;
  createdAt: string;
  isSuspended: boolean;
  goalsCount: number;
  totalCollectedPaise: number;
}

interface CoupleInspectorTableProps {
  initialCouples: CoupleItem[];
}

export function CoupleInspectorTable({ initialCouples }: CoupleInspectorTableProps) {
  const [couples, setCouples] = useState<CoupleItem[]>(initialCouples);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredCouples = couples.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.partnerOneName.toLowerCase().includes(q) ||
      c.partnerTwoName.toLowerCase().includes(q) ||
      c.weddingCode.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.profileSlug.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === "active") return !c.isSuspended;
    if (statusFilter === "suspended") return c.isSuspended;
    return true;
  });

  const handleToggleStatus = async (couple: CoupleItem) => {
    const confirmMsg = couple.isSuspended
      ? `Reactivate registry for ${couple.partnerOneName} & ${couple.partnerTwoName}?`
      : `Are you sure you want to SUSPEND registry for ${couple.partnerOneName} & ${couple.partnerTwoName}? Guests will not be able to contribute.`;

    if (!window.confirm(confirmMsg)) return;

    setLoadingId(couple.id);
    sound.playClickBeep();

    try {
      const res = await fetch(`/api/admin/couples/${couple.id}/toggle-status`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update couple status");
      }

      const data = await res.json();
      setCouples((prev) =>
        prev.map((item) =>
          item.id === couple.id ? { ...item, isSuspended: data.isSuspended } : item
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <PixelInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search couple, code, email..."
            className="bg-cream font-retro text-lg"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-pixel text-[10px] text-vintage">FILTER:</span>
          {(["all", "active", "suspended"] as const).map((filter) => (
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
          ))}
        </div>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden space-y-3">
        {filteredCouples.length === 0 ? (
          <div className="p-6 text-center text-vintage font-retro text-xl bg-cream border-4 border-deep">
            No couples matching filter criteria.
          </div>
        ) : (
          filteredCouples.map((c) => (
            <div
              key={c.id}
              className="bg-cream border-4 border-deep p-4 space-y-3 shadow-pixel-sm"
            >
              <div className="flex items-start justify-between gap-2 border-b-2 border-deep/15 pb-2">
                <div>
                  <span className="font-bold text-deep text-xl block">
                    {c.partnerOneName} &amp; {c.partnerTwoName}
                  </span>
                  <span className="font-retro text-sm text-vintage block">{c.email}</span>
                </div>
                <PixelBadge variant={c.isSuspended ? "archived" : "active"} size="sm">
                  {c.isSuspended ? "SUSPENDED" : "ACTIVE"}
                </PixelBadge>
              </div>

              <div className="grid grid-cols-2 gap-2 font-retro text-base">
                <div>
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    CODE / SLUG
                  </span>
                  <span className="font-pixel text-xs text-deep">{c.weddingCode}</span>
                  <Link
                    href={`/wedding/${c.profileSlug}`}
                    target="_blank"
                    className="font-retro text-sm text-vintage hover:underline block"
                  >
                    /{c.profileSlug} ↗
                  </Link>
                </div>

                <div>
                  <span className="font-pixel text-[9px] text-vintage uppercase block">
                    SHAGUN COLLECTED
                  </span>
                  <span className="font-pixel text-xs text-deep font-bold">
                    {formatIndianRupees(c.totalCollectedPaise)}
                  </span>
                  <span className="font-retro text-sm text-vintage block">
                    {c.goalsCount} goals
                  </span>
                </div>
              </div>

              <div className="border-t border-deep/15 pt-2 flex items-center justify-between">
                <span className="font-retro text-sm text-vintage">
                  Wedding: {new Date(c.weddingDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <PixelButton
                  variant={c.isSuspended ? "secondary" : "danger"}
                  size="sm"
                  disabled={loadingId === c.id}
                  onClick={() => handleToggleStatus(c)}
                  className="text-[9px]"
                >
                  {loadingId === c.id
                    ? "SAVING..."
                    : c.isSuspended
                    ? "REACTIVATE"
                    : "SUSPEND"}
                </PixelButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border-4 border-deep bg-cream">
        <table className="w-full text-left font-retro text-lg">
          <thead className="bg-soft-blush border-b-2 border-deep font-pixel text-[10px] text-deep">
            <tr>
              <th className="p-3">COUPLE</th>
              <th className="p-3">CODE / SLUG</th>
              <th className="p-3">WEDDING DATE</th>
              <th className="p-3">GOALS</th>
              <th className="p-3">SHAGUN COLLECTED</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-deep/15">
            {filteredCouples.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-vintage font-retro text-xl">
                  No couples matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredCouples.map((c) => (
                <tr key={c.id} className="hover:bg-soft-blush/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-deep text-xl">
                      {c.partnerOneName} &amp; {c.partnerTwoName}
                    </div>
                    <div className="font-retro text-sm text-vintage">{c.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-pixel text-xs text-deep">{c.weddingCode}</div>
                    <Link
                      href={`/wedding/${c.profileSlug}`}
                      target="_blank"
                      className="font-retro text-sm text-vintage hover:underline hover:text-deep"
                    >
                      /{c.profileSlug} ↗
                    </Link>
                  </td>
                  <td className="p-3 text-vintage">
                    {new Date(c.weddingDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3">
                    <span className="font-pixel text-xs text-deep">
                      {c.goalsCount} goals
                    </span>
                  </td>
                  <td className="p-3 font-bold text-deep text-xl">
                    {formatIndianRupees(c.totalCollectedPaise)}
                  </td>
                  <td className="p-3">
                    <PixelBadge
                      variant={c.isSuspended ? "archived" : "active"}
                      size="sm"
                    >
                      {c.isSuspended ? "SUSPENDED" : "ACTIVE"}
                    </PixelBadge>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <PixelButton
                      variant={c.isSuspended ? "secondary" : "danger"}
                      size="sm"
                      disabled={loadingId === c.id}
                      onClick={() => handleToggleStatus(c)}
                      className="text-[9px]"
                    >
                      {loadingId === c.id
                        ? "SAVING..."
                        : c.isSuspended
                        ? "REACTIVATE"
                        : "SUSPEND"}
                    </PixelButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
