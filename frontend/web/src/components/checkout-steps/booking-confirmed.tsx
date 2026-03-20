"use client";

import React from "react";
import Link from "next/link";
import type { CheckoutCourt, CheckoutSlot } from "@allcourts/types";
import { formatCurrency } from "@/lib/env";

type BookingConfirmedProps = {
  court: CheckoutCourt;
  slots: CheckoutSlot[];
  bookingId: string;
  name: string;
};

export function BookingConfirmed({ court, slots, bookingId, name }: BookingConfirmedProps) {
  const totalCents = slots.reduce((sum, s) => sum + s.priceCents, 0);
  const totalPrice = formatCurrency(totalCents / 100);
  const shortRef = bookingId.slice(0, 8).toUpperCase();

  const rows: [string, React.ReactNode][] = [
    ["Reference", <strong key="ref" className="font-mono text-brand-accent">{shortRef}</strong>],
    ["Court", `${court.facilityName} · ${court.courtName}`],
    ...slots.map((slot, i): [string, string] => {
      const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
      });
      return [slots.length > 1 ? `Slot ${i + 1}` : "Date & time", `${dateLabel} · ${slot.label}`];
    }),
    ["Booked for", name],
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      {/* Confirmation icon */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/15 text-3xl font-black text-brand-accent ring-4 ring-brand-accent/20"
        aria-hidden="true"
      >
        ✓
      </div>

      <div>
        <h2 className="mb-1 text-2xl font-extrabold text-white">You&apos;re booked!</h2>
        <p className="text-sm text-slate-400">
          Your provisional booking has been received. The facility will confirm shortly.
        </p>
      </div>

      {/* Summary card */}
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-700/20 bg-white/[0.03]">
        {rows.map(([label, value], i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-b border-slate-700/15 px-4 py-3 text-sm last:border-b-0"
          >
            <span className="text-slate-400">{label}</span>
            <span className="text-right text-white">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-slate-700/25 px-4 py-3 font-bold">
          <span className="text-slate-300">Total</span>
          <strong className="text-brand-accent">{totalPrice}</strong>
        </div>
      </div>

      <p className="max-w-xs text-xs text-slate-400">
        Status: <strong className="text-slate-300">Awaiting payment</strong>. You&apos;ll receive a
        confirmation once the booking is processed.
      </p>

      <Link
        className="inline-flex min-h-[46px] items-center rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-8 font-bold text-slate-900 transition hover:-translate-y-px hover:shadow-lg"
        href="/discover"
      >
        Back to Discover
      </Link>
    </div>
  );
}
