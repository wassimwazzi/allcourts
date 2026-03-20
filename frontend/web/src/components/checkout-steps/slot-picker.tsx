"use client";

import type { CheckoutCourt, CheckoutSlot } from "@allcourts/types";
import { formatCurrency } from "@/lib/env";

type SlotPickerProps = {
  court: CheckoutCourt;
  selectedDate: string;
  selectedSlot: CheckoutSlot | null;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: CheckoutSlot) => void;
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

export function SlotPicker({ court, selectedDate, selectedSlot, onDateChange, onSlotSelect, onNext }: SlotPickerProps) {
  const availableDates = Object.keys(court.availabilityByDay).sort().slice(0, 7);
  const slotsForDate = court.availabilityByDay[selectedDate] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-2xl font-extrabold text-white">Pick a time slot</h2>
        <p className="text-sm text-slate-400">{court.facilityName} · {court.courtName}</p>
      </div>

      {availableDates.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          No availability found for this court in the next 14 days.
        </p>
      ) : (
        <>
          {/* Date strip */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            role="group"
            aria-label="Select date"
          >
            {availableDates.map((date) => {
              const { weekday, day } = formatDayLabel(date);
              const isActive = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-4 py-3 text-center text-sm transition ${
                    isActive
                      ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                      : "border-slate-700/25 bg-white/[0.04] text-slate-300 hover:border-slate-600/40 hover:bg-white/[0.07]"
                  }`}
                  onClick={() => onDateChange(date)}
                  aria-pressed={isActive}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide">{weekday}</span>
                  <span className="font-bold">{day}</span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {slotsForDate.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No slots on this day.</p>
          ) : (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              role="group"
              aria-label="Available time slots"
            >
              {slotsForDate.map((slot, i) => {
                const isActive =
                  selectedSlot?.startTime === slot.startTime && selectedSlot?.date === slot.date;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`flex flex-col gap-1 rounded-xl border px-4 py-3.5 text-left transition ${
                      isActive
                        ? "border-brand-accent bg-brand-accent/15"
                        : "border-slate-700/25 bg-white/[0.03] hover:border-slate-600/40 hover:bg-white/[0.07]"
                    }`}
                    onClick={() => onSlotSelect(slot)}
                    aria-pressed={isActive}
                  >
                    <span className={`text-sm font-semibold ${isActive ? "text-brand-accent" : "text-white"}`}>
                      {slot.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatCurrency(slot.priceCents / 100)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="flex">
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-6 font-bold text-slate-900 transition hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!selectedSlot}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
