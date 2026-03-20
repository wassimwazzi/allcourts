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
  const [selectedSlots, setSelectedSlots] = useState<CheckoutSlot[]>([]);
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
    if (selectedSlots.length === 0) return;
    setLoading(true);
    setError(null);

    let firstBookingId = "";
    for (let i = 0; i < selectedSlots.length; i++) {
      const slot = selectedSlots[i];
      const result = await submitBooking({
        courtId: court.courtId,
        bookingDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subtotalCents: slot.priceCents,
        currency: slot.currency,
        bookedForName: name,
        bookedForPhone: phone,
        notes,
        idempotencyKey: `${idempotencyKey}-${i}`,
      });

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (i === 0) firstBookingId = result.bookingId;
    }

    setLoading(false);
    setBookingId(firstBookingId);
    setStep("confirmed");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 pb-20">
      {/* Progress bar */}
      {step !== "confirmed" && (
        <nav className="flex items-center justify-center gap-0" aria-label="Checkout steps">
          {STEPS.filter((s) => s.id !== "confirmed").map((s, i) => (
            <div
              key={s.id}
              className={`relative flex flex-col items-center gap-2 px-4 ${
                i < currentStepIndex 
                  ? "text-brand-accent" 
                  : i === currentStepIndex 
                  ? "text-white" 
                  : "text-slate-500"
              }`}
              aria-current={s.id === step ? "step" : undefined}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                i < currentStepIndex
                  ? "bg-brand-accent/20 text-brand-accent"
                  : i === currentStepIndex
                  ? "bg-white/10 text-white ring-2 ring-white/30"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {i < currentStepIndex ? "✓" : i + 1}
              </span>
              <span className="text-xs font-medium">{s.label}</span>
              {i < 2 && (
                <span 
                  className={`absolute left-1/2 top-5 h-0.5 w-full ${
                    i < currentStepIndex ? "bg-brand-accent/40" : "bg-slate-700"
                  }`}
                  aria-hidden="true" 
                />
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Step panels */}
      <div className="overflow-hidden rounded-3xl border border-slate-700/20 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 shadow-2xl md:p-8">
        {step === "slot" && (
          <SlotPicker
            court={court}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onDateChange={(d) => { setSelectedDate(d); setSelectedSlots([]); }}
            onSlotToggle={(slot) => {
              setSelectedSlots((prev) => {
                const exists = prev.some((s) => s.startTime === slot.startTime && s.date === slot.date);
                return exists
                  ? prev.filter((s) => !(s.startTime === slot.startTime && s.date === slot.date))
                  : [...prev, slot];
              });
            }}
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
        {step === "payment" && selectedSlots.length > 0 && (
          <PaymentForm
            court={court}
            slots={selectedSlots}
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
        {step === "confirmed" && selectedSlots.length > 0 && (
          <BookingConfirmed
            court={court}
            slots={selectedSlots}
            bookingId={bookingId}
            name={name}
          />
        )}
      </div>
    </div>
  );
}
