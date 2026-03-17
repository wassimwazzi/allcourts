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

export function PaymentForm({
  court, slots, name, cardNumber, expiry, cvv,
  onCardNumberChange, onExpiryChange, onCvvChange,
  onBack, onSubmit, loading, error,
}: PaymentFormProps) {
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const totalCents = slots.reduce((sum, s) => sum + s.priceCents, 0);
  const totalFormatted = formatCurrency(totalCents / 100);
  const dateLabel = new Date(first.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeRange = slots.length === 1
    ? first.label
    : `${first.startTime} – ${last.endTime}`;

  return (
    <div className="checkout-step">
      <h2 className="checkout-step-title">Payment</h2>
      <p className="checkout-step-subtitle">Review your booking and enter payment details.</p>

      {/* Booking summary */}
      <div className="checkout-summary">
        <div className="checkout-summary-row">
          <span>{court.facilityName} · {court.courtName}</span>
        </div>
        <div className="checkout-summary-row">
          <span>{dateLabel}</span>
          <span>{timeRange}</span>
        </div>
        {slots.length > 1 && (
          <div className="checkout-summary-row">
            <span>{slots.length} slots</span>
            <span>{slots.map(s => formatCurrency(s.priceCents / 100)).join(" + ")}</span>
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

      {/* Dummy payment fields */}
      <div className="checkout-payment-section">
        <p className="checkout-payment-label">
          <span className="checkout-lock-icon" aria-hidden="true">🔒</span>
          Card details
        </p>

        <div className="checkout-fields">
          <label className="checkout-field">
            <span className="checkout-field-label">Card number</span>
            <input
              type="text"
              className="checkout-input"
              value={cardNumber}
              onChange={(e) => onCardNumberChange(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              maxLength={19}
              autoComplete="cc-number"
            />
          </label>

          <div className="checkout-fields-row">
            <label className="checkout-field">
              <span className="checkout-field-label">Expiry</span>
              <input
                type="text"
                className="checkout-input"
                value={expiry}
                onChange={(e) => onExpiryChange(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                inputMode="numeric"
                maxLength={7}
                autoComplete="cc-exp"
              />
            </label>
            <label className="checkout-field">
              <span className="checkout-field-label">CVV</span>
              <input
                type="text"
                className="checkout-input"
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
      </div>

      {error && (
        <div className="checkout-error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-step-actions">
        <button type="button" className="button button-secondary" onClick={onBack} disabled={loading}>
          Back
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Confirming…" : `Confirm Booking · ${totalFormatted}`}
        </button>
      </div>
    </div>
  );
}
