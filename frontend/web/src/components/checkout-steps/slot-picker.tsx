"use client";

import type { CheckoutCourt, CheckoutSlot } from "@allcourts/types";
import { formatCurrency } from "@/lib/env";

type SlotPickerProps = {
  court: CheckoutCourt;
  selectedDate: string;
  selectedSlots: CheckoutSlot[];
  onDateChange: (date: string) => void;
  onSlotToggle: (slot: CheckoutSlot) => void;
  onNext: () => void;
};

function formatDayLabel(dateStr: string): { weekday: string; day: string } {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  return {
    weekday: diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export function SlotPicker({ court, selectedDate, selectedSlots, onDateChange, onSlotToggle, onNext }: SlotPickerProps) {
  const availableDates = Object.keys(court.availabilityByDay).sort().slice(0, 7);
  const slotsForDate = court.availabilityByDay[selectedDate] ?? [];

  const isSelected = (slot: CheckoutSlot) =>
    selectedSlots.some((s) => s.date === slot.date && s.startTime === slot.startTime);

  const totalCents = selectedSlots.reduce((sum, s) => sum + s.priceCents, 0);
  const slotCount = selectedSlots.length;
  const sortedSelected = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const rangeLabel = slotCount > 0
    ? `${sortedSelected[0]!.startTime} – ${sortedSelected[slotCount - 1]!.endTime}`
    : null;

  return (
    <div className="checkout-step">
      <h2 className="checkout-step-title">Pick time slots</h2>
      <p className="checkout-step-subtitle">{court.facilityName} · {court.courtName}</p>

      {availableDates.length === 0 ? (
        <div className="checkout-empty-slots">
          <p>No availability found for this court in the next 14 days.</p>
        </div>
      ) : (
        <>
          {/* Date strip */}
          <div className="slot-date-strip" role="group" aria-label="Select date">
            {availableDates.map((date) => {
              const { weekday, day } = formatDayLabel(date);
              return (
                <button
                  key={date}
                  type="button"
                  className={`slot-date-btn${date === selectedDate ? " slot-date-active" : ""}`}
                  onClick={() => onDateChange(date)}
                  aria-pressed={date === selectedDate}
                >
                  <span className="slot-date-weekday">{weekday}</span>
                  <span className="slot-date-day">{day}</span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {slotsForDate.length === 0 ? (
            <p className="checkout-empty-slots">No slots on this day.</p>
          ) : (
            <div className="slot-grid" role="group" aria-label="Available time slots">
              {slotsForDate.map((slot, i) => {
                const active = isSelected(slot);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`slot-btn${active ? " slot-btn-active" : ""}`}
                    onClick={() => onSlotToggle(slot)}
                    aria-pressed={active}
                  >
                    <span className="slot-btn-time">{slot.label}</span>
                    <span className="slot-btn-price">{formatCurrency(slot.priceCents / 100)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selection summary */}
          {slotCount > 0 && (
            <div className="slot-selection-summary">
              <span className="slot-summary-count">{slotCount} slot{slotCount > 1 ? "s" : ""}</span>
              {rangeLabel && <span className="slot-summary-range">{rangeLabel}</span>}
              <span className="slot-summary-total">{formatCurrency(totalCents / 100)}</span>
            </div>
          )}
        </>
      )}

      <div className="checkout-step-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={onNext}
          disabled={slotCount === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
