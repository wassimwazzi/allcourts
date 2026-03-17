"use client";

import { useState, useMemo } from "react";
import type { CheckoutCourt, CheckoutSlot, CheckoutStep } from "@allcourts/types";
import { SlotPicker } from "@/components/checkout-steps/slot-picker";
import { DetailsForm } from "@/components/checkout-steps/details-form";
import { PaymentForm } from "@/components/checkout-steps/payment-form";
import { BookingConfirmed } from "@/components/checkout-steps/booking-confirmed";
import { submitBooking } from "@/lib/checkout";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "slot", label: "Slot" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "confirmed", label: "Confirmed" },
];

type CheckoutFlowProps = {
  court: CheckoutCourt;
};

export function CheckoutFlow({ court }: CheckoutFlowProps) {
  const firstDate = Object.keys(court.availabilityByDay).sort()[0] ?? "";

  const [step, setStep] = useState<CheckoutStep>("slot");
  const [selectedDate, setSelectedDate] = useState(firstDate);
  const [selectedSlot, setSelectedSlot] = useState<CheckoutSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState("");

  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  async function handleSubmit() {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);

    const result = await submitBooking({
      courtId: court.courtId,
      bookingDate: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      subtotalCents: selectedSlot.priceCents,
      currency: selectedSlot.currency,
      bookedForName: name,
      bookedForPhone: phone,
      notes,
      idempotencyKey,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setBookingId(result.bookingId);
    setStep("confirmed");
  }

  return (
    <div className="checkout-shell">
      {/* Progress bar */}
      {step !== "confirmed" && (
        <nav className="checkout-progress" aria-label="Checkout steps">
          {STEPS.filter((s) => s.id !== "confirmed").map((s, i) => (
            <div
              key={s.id}
              className={`checkout-progress-step${i < currentStepIndex ? " checkout-progress-done" : i === currentStepIndex ? " checkout-progress-active" : ""}`}
              aria-current={s.id === step ? "step" : undefined}
            >
              <span className="checkout-progress-num">
                {i < currentStepIndex ? "✓" : i + 1}
              </span>
              <span className="checkout-progress-label">{s.label}</span>
              {i < 2 && <span className="checkout-progress-line" aria-hidden="true" />}
            </div>
          ))}
        </nav>
      )}

      {/* Step panels */}
      <div className="checkout-panel surface">
        {step === "slot" && (
          <SlotPicker
            court={court}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
            onSlotSelect={setSelectedSlot}
            onNext={() => setStep("details")}
          />
        )}
        {step === "details" && (
          <DetailsForm
            name={name}
            phone={phone}
            notes={notes}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onNotesChange={setNotes}
            onBack={() => setStep("slot")}
            onNext={() => setStep("payment")}
          />
        )}
        {step === "payment" && selectedSlot && (
          <PaymentForm
            court={court}
            slot={selectedSlot}
            name={name}
            cardNumber={cardNumber}
            expiry={expiry}
            cvv={cvv}
            onCardNumberChange={setCardNumber}
            onExpiryChange={setExpiry}
            onCvvChange={setCvv}
            onBack={() => setStep("details")}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        )}
        {step === "confirmed" && selectedSlot && (
          <BookingConfirmed
            court={court}
            slot={selectedSlot}
            bookingId={bookingId}
            name={name}
          />
        )}
      </div>
    </div>
  );
}
