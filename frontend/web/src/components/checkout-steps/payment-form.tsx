"use client";

import type { CheckoutCourt, CheckoutSlot } from "@allcourts/types";
import { formatCurrency } from "@/lib/env";

type PaymentFormProps = {
  court: CheckoutCourt;
  slots: CheckoutSlot[];
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  onCardNumberChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCvvChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

const inputClass =
  "w-full rounded-xl border border-slate-700/25 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-brand-accent/50 focus:shadow-[0_0_0_3px_rgb(var(--brand-accent)/0.08)]";

const fieldLabelClass = "mb-1.5 block text-sm font-semibold text-slate-300";

export function PaymentForm({
  court, slots, name, cardNumber, expiry, cvv,
  onCardNumberChange, onExpiryChange, onCvvChange,
  onBack, onSubmit, loading, error,
}: PaymentFormProps) {
  const totalCents = slots.reduce((sum, s) => sum + s.priceCents, 0);
  const totalPrice = formatCurrency(totalCents / 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-2xl font-extrabold text-white">Payment</h2>
        <p className="text-sm text-slate-400">Review your booking and enter payment details.</p>
      </div>

      {/* Booking summary */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-slate-700/20 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-300 border-b border-slate-700/15">
          <span>{court.facilityName} · {court.courtName}</span>
        </div>
        {slots.map((slot, i) => {
          const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          });
          return (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-300 border-b border-slate-700/15">
              <span>{dateLabel} · {slot.label}</span>
              <span className="text-slate-400">{formatCurrency(slot.priceCents / 100)}</span>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-300 border-b border-slate-700/15">
          <span>Booked for</span>
          <span className="text-slate-400">{name}</span>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-base font-bold text-white border-t border-slate-700/25">
          <span>Total</span>
          <strong className="text-brand-accent">{totalPrice}</strong>
        </div>
      </div>

      {/* Dummy payment fields */}
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span aria-hidden="true">🔒</span> Card details
        </p>

        <label className="flex flex-col">
          <span className={fieldLabelClass}>Card number</span>
          <input
            type="text"
            className={inputClass}
            value={cardNumber}
            onChange={(e) => onCardNumberChange(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            maxLength={19}
            autoComplete="cc-number"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span className={fieldLabelClass}>Expiry</span>
            <input
              type="text"
              className={inputClass}
              value={expiry}
              onChange={(e) => onExpiryChange(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              inputMode="numeric"
              maxLength={7}
              autoComplete="cc-exp"
            />
          </label>
          <label className="flex flex-col">
            <span className={fieldLabelClass}>CVV</span>
            <input
              type="text"
              className={inputClass}
              value={cvv}
              onChange={(e) => onCvvChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
              maxLength={4}
              autoComplete="cc-csc"
            />
          </label>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center rounded-full border border-white/10 bg-white/[0.04] px-6 font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-6 font-bold text-slate-900 transition hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Confirming…" : `Confirm Booking · ${totalPrice}`}
        </button>
      </div>
    </div>
  );
}
