"use client";

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
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const totalCents = slots.reduce((sum, s) => sum + s.priceCents, 0);
  const totalFormatted = formatCurrency(totalCents / 100);
  const dateLabel = new Date(first.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
  const timeRange = slots.length === 1
    ? first.label
    : `${first.startTime} – ${last.endTime}`;
  const shortRef = bookingId.slice(0, 8).toUpperCase();

  return (
    <div className="checkout-step checkout-confirmed">
      <div className="checkout-confirmed-icon" aria-hidden="true">✓</div>

      <h2 className="checkout-step-title">You&apos;re booked!</h2>
      <p className="checkout-step-subtitle">
        Your provisional booking has been received. The facility will confirm shortly.
      </p>

      <div className="checkout-summary checkout-confirmed-summary">
        <div className="checkout-summary-row">
          <span>Reference</span>
          <strong className="checkout-ref">{shortRef}</strong>
        </div>
        <div className="checkout-summary-row">
          <span>Court</span>
          <span>{court.facilityName} · {court.courtName}</span>
        </div>
        <div className="checkout-summary-row">
          <span>Date</span>
          <span>{dateLabel}</span>
        </div>
        <div className="checkout-summary-row">
          <span>Time</span>
          <span>{timeRange}</span>
        </div>
        {slots.length > 1 && (
          <div className="checkout-summary-row">
            <span>Duration</span>
            <span>{slots.length} slots</span>
          </div>
        )}
        <div className="checkout-summary-row">
          <span>Booked for</span>
          <span>{name}</span>
        </div>
        <div className="checkout-summary-divider" />
        <div className="checkout-summary-row checkout-summary-total">
          <span>Total</span>
          <strong>{totalFormatted}</strong>
        </div>
      </div>

      <p className="checkout-confirmed-note">
        Status: <strong>Awaiting payment</strong>. You&apos;ll receive a confirmation once the booking is processed.
      </p>

      <Link className="button button-primary" href="/discover">
        Back to Discover
      </Link>
    </div>
  );
}
