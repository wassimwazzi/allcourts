import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingSummary, BookingDetail, BookingParticipant } from "@allcourts/types";

type RawBookingRow = {
  id: string;
  profile_id: string;
  booking_reference: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  status: string;
  payment_status: string;
  total_cents: number;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  platform_fee_cents: number;
  currency: string;
  notes: string | null;
  booked_for_name: string | null;
  booked_for_phone: string | null;
  guest_count: number;
  confirmed_at: string | null;
  cancelled_at: string | null;
  courts: {
    id: string;
    name: string;
    facilities: {
      name: string;
      city: string | null;
    } | null;
  } | null;
};

type RawParticipantRow = {
  id: string;
  booking_id: string;
  inviter_profile_id: string;
  invitee_profile_id: string | null;
  invitee_email: string;
  role: string;
  status: string;
  invited_at: string;
  responded_at: string | null;
};

function toSummary(row: RawBookingRow): BookingSummary {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    courtId: row.courts?.id ?? "",
    courtName: row.courts?.name ?? "Unknown court",
    facilityName: row.courts?.facilities?.name ?? "Unknown facility",
    facilityCity: row.courts?.facilities?.city ?? undefined,
    bookingDate: row.booking_date,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    status: row.status as BookingSummary["status"],
    paymentStatus: row.payment_status as BookingSummary["paymentStatus"],
    totalCents: row.total_cents,
    currency: row.currency,
  };
}

function toParticipant(row: RawParticipantRow): BookingParticipant {
  return {
    id: row.id,
    bookingId: row.booking_id,
    inviterProfileId: row.inviter_profile_id,
    inviteeProfileId: row.invitee_profile_id ?? undefined,
    inviteeEmail: row.invitee_email,
    role: row.role as BookingParticipant["role"],
    status: row.status as BookingParticipant["status"],
    invitedAt: row.invited_at,
    respondedAt: row.responded_at ?? undefined,
  };
}

const BOOKING_SELECT = `
  id, profile_id, booking_reference, booking_date, start_time, end_time, timezone,
  status, payment_status, total_cents, subtotal_cents, discount_cents,
  tax_cents, platform_fee_cents, currency, notes, booked_for_name,
  booked_for_phone, guest_count, confirmed_at, cancelled_at,
  courts ( id, name, facilities ( name, city ) )
`.trim();

export async function getUserBookings(
  supabase: SupabaseClient,
  filter: "upcoming" | "past" | "all" = "all"
): Promise<BookingSummary[]> {
  let query = supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("booking_date", { ascending: filter !== "past" })
    .order("start_time", { ascending: filter !== "past" });

  const today = new Date().toISOString().split("T")[0];

  if (filter === "upcoming") {
    query = query
      .gte("booking_date", today)
      .in("status", ["pending", "awaiting_payment", "confirmed", "checked_in"]);
  } else if (filter === "past") {
    query = query
      .or(`booking_date.lt.${today},status.in.(completed,cancelled,refunded,no_show)`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toSummary(r as unknown as RawBookingRow));
}

export async function getBookingDetail(
  supabase: SupabaseClient,
  bookingId: string
): Promise<BookingDetail | null> {
  const [bookingResult, participantsResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("id", bookingId)
      .single(),
    supabase
      .from("booking_participants")
      .select("id, booking_id, inviter_profile_id, invitee_profile_id, invitee_email, role, status, invited_at, responded_at")
      .eq("booking_id", bookingId),
  ]);

  if (bookingResult.error || !bookingResult.data) return null;

  const row = bookingResult.data as unknown as RawBookingRow;
  const participants = (participantsResult.data ?? []).map((p) =>
    toParticipant(p as RawParticipantRow)
  );

  return {
    ...toSummary(row),
    ownerProfileId: row.profile_id,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents,
    taxCents: row.tax_cents,
    platformFeeCents: row.platform_fee_cents,
    notes: row.notes ?? undefined,
    bookedForName: row.booked_for_name ?? undefined,
    bookedForPhone: row.booked_for_phone ?? undefined,
    guestCount: row.guest_count,
    confirmedAt: row.confirmed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    participants,
  };
}

const CANCELLABLE_STATUSES = ["pending", "awaiting_payment", "confirmed"];

export function isCancellable(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

export async function cancelBooking(
  supabase: SupabaseClient,
  bookingId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancellation_reason: "Cancelled by user" })
    .eq("id", bookingId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function acceptInvitation(
  supabase: SupabaseClient,
  participantId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("booking_participants")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function declineInvitation(
  supabase: SupabaseClient,
  participantId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("booking_participants")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
