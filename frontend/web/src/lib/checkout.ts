import { getPublicSupabaseEnv } from "@/lib/env";
import { getAuthenticatedSession } from "@/lib/supabase-client";
import type { CheckoutCourt, CheckoutSlot } from "@allcourts/types";

type CourtRecord = {
  id: string;
  facility_id: string;
  name: string;
  sport_type: string;
  currency: string;
  metadata: Record<string, unknown> | null;
};

type FacilityRecord = {
  id: string;
  name: string;
  city: string | null;
  state_region: string | null;
  address_line1: string | null;
  settings: Record<string, unknown> | null;
};

type AvailabilityRecord = {
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  price_cents: number;
  currency: string;
  availability_type: "recurring" | "override" | "blackout";
  is_bookable: boolean;
};

type BookingConflictRecord = {
  booking_date: string;
  start_time: string;
  end_time: string;
};

type BlockedRange = {
  startTime: string;
  endTime: string;
};


function formatSlotLabel(startTime: string, endTime: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  };
  return `${fmt(startTime)} – ${fmt(endTime)}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function toDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeTimeToMinute(time: string): string {
  return time.slice(0, 5);
}

function slotOverlapsBlockedRange(slotStart: string, slotEnd: string, blockedRange: BlockedRange): boolean {
  const normalizedSlotStart = normalizeTimeToMinute(slotStart);
  const normalizedSlotEnd = normalizeTimeToMinute(slotEnd);
  const normalizedBlockedStart = normalizeTimeToMinute(blockedRange.startTime);
  const normalizedBlockedEnd = normalizeTimeToMinute(blockedRange.endTime);

  return normalizedSlotStart < normalizedBlockedEnd && normalizedSlotEnd > normalizedBlockedStart;
}

export function filterSlotsByBlockedRanges(slots: CheckoutSlot[], blockedRanges: BlockedRange[]): CheckoutSlot[] {
  if (blockedRanges.length === 0) {
    return slots;
  }

  return slots.filter(
    (slot) => !blockedRanges.some((blocked) => slotOverlapsBlockedRange(slot.startTime, slot.endTime, blocked))
  );
}

async function fetchRest<T>(path: string): Promise<T> {
  const config = getPublicSupabaseEnv();
  if (!config) throw new Error("Supabase not configured.");

  const res = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: config.supabaseAnonKey,
      authorization: `Bearer ${config.supabaseAnonKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`REST error ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchRpc<T>(functionName: string, payload: Record<string, unknown>): Promise<T> {
  const config = getPublicSupabaseEnv();
  if (!config) throw new Error("Supabase not configured.");

  const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
      authorization: `Bearer ${config.supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const responseBody = await res.text().catch(() => "");
    throw new Error(`RPC error ${res.status} for ${functionName}: ${responseBody || "<empty body>"}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchCourtWithAvailability(courtId: string): Promise<CheckoutCourt | null> {
  try {
    const today = new Date();
    const windowStart = toDateOnly(today);
    const windowEndDate = new Date(today);
    windowEndDate.setDate(today.getDate() + 13);
    const windowEnd = toDateOnly(windowEndDate);

    const [courts, facilities, availability, activeBookings] = await Promise.all([
      fetchRest<CourtRecord[]>(`courts?id=eq.${courtId}&select=id,facility_id,name,sport_type,currency,metadata`),
      fetchRest<FacilityRecord[]>(
        `facilities?select=id,name,city,state_region,address_line1,settings`
      ),
      fetchRest<AvailabilityRecord[]>(
        `court_availability?court_id=eq.${courtId}&is_bookable=is.true&select=court_id,day_of_week,start_time,end_time,slot_minutes,price_cents,currency,availability_type,is_bookable`
      ),
      fetchRpc<BookingConflictRecord[]>(
        "get_court_occupied_slots",
        {
          p_court_id: courtId,
          p_start_date: windowStart,
          p_end_date: windowEnd,
        }
      ).catch((error) => {
        console.error("Error fetching occupied slots:", error);
        return [];
      }),
    ]);


    const court = courts[0];
    if (!court) return null;

    const facility = facilities.find((f) => f.id === court.facility_id);
    if (!facility) return null;

    const bookableSlots = availability.filter(
      (a) => a.is_bookable && a.availability_type !== "blackout"
    );


    const blockedRangesByDate = activeBookings.reduce<Record<string, BlockedRange[]>>(
      (acc, booking) => {
        const date = booking.booking_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({
          startTime: normalizeTimeToMinute(booking.start_time),
          endTime: normalizeTimeToMinute(booking.end_time),
        });
        return acc;
      },
      {}
    );

    const availabilityByDay: Record<string, CheckoutSlot[]> = {};

    // Generate slots for the next 14 days from availability rules
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay();
      const dateStr = toDateOnly(d);

      const dayRules = bookableSlots.filter((a) => a.day_of_week === dow);
      const generatedSlots: CheckoutSlot[] = [];
      const blockedRanges = blockedRangesByDate[dateStr] ?? [];

      for (const rule of dayRules) {
        const ruleStart = normalizeTimeToMinute(rule.start_time);
        const ruleEnd = normalizeTimeToMinute(rule.end_time);
        let current = ruleStart;

        while (current < ruleEnd) {
          const next = addMinutes(current, rule.slot_minutes);
          if (next > ruleEnd) break;

          generatedSlots.push({
            date: dateStr,
            startTime: current,
            endTime: next,
            priceCents: rule.price_cents,
            currency: rule.currency,
            label: formatSlotLabel(current, next),
          });

          current = next;
        }
      }

      const slots = filterSlotsByBlockedRanges(generatedSlots, blockedRanges);


      if (slots.length > 0) {
        availabilityByDay[dateStr] = slots;
      }
    }


    const sportImages: Record<string, string> = {
      tennis: "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=900&q=80",
      padel: "https://images.unsplash.com/photo-1622279457486-62dcc4a43110?auto=format&fit=crop&w=900&q=80",
      pickleball: "https://images.unsplash.com/photo-1653400883961-0e6e15f598fd?auto=format&fit=crop&w=900&q=80",
      futsal: "https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=900&q=80",
    };
    const metaImage = court.metadata?.image_url as string | undefined;
    const settingsImage = facility.settings?.listing_image_url as string | undefined;
    const imageUrl =
      metaImage ?? settingsImage ?? sportImages[court.sport_type] ??
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80";

    return {
      courtId: court.id,
      courtName: court.name,
      facilityName: facility.name,
      sport: court.sport_type.charAt(0).toUpperCase() + court.sport_type.slice(1),
      location: [facility.city, facility.state_region].filter(Boolean).join(", "),
      imageUrl,
      currency: court.currency,
      availabilityByDay,
    };
  } catch (error) {
    console.error("Error fetching court availability:", error);
    return null;
  }
}

export type BookingSubmitParams = {
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  subtotalCents: number;
  currency: string;
  bookedForName: string;
  bookedForPhone: string;
  notes: string;
  idempotencyKey: string;
};

export type BookingResult =
  | { ok: true; bookingId: string; bookingReference?: string; status: string }
  | { ok: false; error: string };

export async function submitBooking(params: BookingSubmitParams): Promise<BookingResult> {
  const config = getPublicSupabaseEnv();
  if (!config) {
    return { ok: false, error: "Supabase is not configured on this deployment." };
  }

  const accessToken = await getAuthenticatedSession();
  if (!accessToken) {
    return { ok: false, error: "Please sign in to complete your booking." };
  }

  const body = {
    courtId: params.courtId,
    bookingDate: params.bookingDate,
    startTime: params.startTime,
    endTime: params.endTime,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    subtotalCents: params.subtotalCents,
    discountCents: 0,
    taxCents: 0,
    totalCents: params.subtotalCents,
    platformFeeCents: 0,
    currency: params.currency,
    bookedForName: params.bookedForName,
    bookedForPhone: params.bookedForPhone,
    notes: params.notes || undefined,
  };

  try {
    const res = await fetch(`${config.supabaseUrl}/functions/v1/booking-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = (errData as { message?: string }).message ?? `Request failed (${res.status})`;
      return { ok: false, error: msg };
    }

    const data = await res.json() as { bookingId: string; bookingReference: string; status: string };
    return { ok: true, bookingId: data.bookingId, bookingReference: data.bookingReference, status: data.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error." };
  }
}
