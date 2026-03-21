import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CheckoutSlot } from "@allcourts/types";
import { filterSlotsByBlockedRanges } from "./checkout";

function makeSlot(startTime: string, endTime: string): CheckoutSlot {
  return {
    date: "2026-03-20",
    startTime,
    endTime,
    priceCents: 2000,
    currency: "usd",
    label: `${startTime}-${endTime}`,
  };
}

describe("filterSlotsByBlockedRanges", () => {
  it("filters slot with exact overlap", () => {
    const slots = [makeSlot("09:00", "10:00"), makeSlot("10:00", "11:00")];

    const result = filterSlotsByBlockedRanges(slots, [
      { startTime: "09:00:00", endTime: "10:00:00" },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.startTime, "10:00");
  });

  it("keeps adjacent slot that only touches boundary", () => {
    const slots = [makeSlot("08:00", "09:00"), makeSlot("09:00", "10:00")];

    const result = filterSlotsByBlockedRanges(slots, [
      { startTime: "09:00:00", endTime: "10:00:00" },
    ]);

    assert.deepEqual(result.map((slot) => slot.startTime), ["08:00"]);
  });

  it("filters partial overlaps", () => {
    const slots = [
      makeSlot("09:00", "09:30"),
      makeSlot("09:30", "10:00"),
      makeSlot("10:00", "10:30"),
    ];

    const result = filterSlotsByBlockedRanges(slots, [
      { startTime: "09:20:00", endTime: "10:10:00" },
    ]);

    assert.equal(result.length, 0);
  });

  it("handles multiple blocked ranges", () => {
    const slots = [
      makeSlot("09:00", "10:00"),
      makeSlot("10:00", "11:00"),
      makeSlot("11:00", "12:00"),
      makeSlot("12:00", "13:00"),
    ];

    const result = filterSlotsByBlockedRanges(slots, [
      { startTime: "09:00:00", endTime: "10:00:00" },
      { startTime: "11:00:00", endTime: "12:00:00" },
    ]);

    assert.deepEqual(result.map((slot) => slot.startTime), ["10:00", "12:00"]);
  });

  it("returns original slots when there are no blocked ranges", () => {
    const slots = [makeSlot("09:00", "10:00"), makeSlot("10:00", "11:00")];

    const result = filterSlotsByBlockedRanges(slots, []);

    assert.deepEqual(result, slots);
  });
});
