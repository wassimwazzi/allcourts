import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

function placeholderCheckoutReference(bookingId: string) {
  return `placeholder_${bookingId.replace(/-/g, "").slice(0, 24)}`;
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server env vars not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getAuthenticatedUser(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return { user: null, error: "missing_bearer_token" };
  }
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { user: null, error: "invalid_bearer_token" };
  return { user: data.user, error: null };
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();
    const {
      courtId, bookingDate, startTime, endTime, timezone = "UTC",
      subtotalCents, discountCents = 0, taxCents = 0, totalCents,
      platformFeeCents = 0, currency, bookedForName, bookedForPhone, notes,
    } = body;

    if (!courtId || !bookingDate || !startTime || !endTime || !bookedForName) {
      return NextResponse.json({ error: "invalid_request", message: "Missing required fields." }, { status: 400 });
    }

    const headerIdempotencyKey = req.headers.get("idempotency-key");
    const idempotencyKey = headerIdempotencyKey ?? `generated:${randomUUID()}`;
    const idempotencyKeySource = headerIdempotencyKey ? "header" : "generated";
    const providerIdempotencyKey = `${user.id}:${idempotencyKey}`;

    const admin = createAdminClient();

    // Check for existing payment attempt (idempotency replay)
    const { data: existingAttempt } = await admin
      .from("booking_payment_attempts")
      .select("id, booking_id, status, amount_cents, currency, external_reference")
      .eq("provider", "stripe")
      .eq("profile_id", user.id)
      .eq("idempotency_key", providerIdempotencyKey)
      .maybeSingle();

    if (existingAttempt) {
      const { data: existingBooking } = await admin
        .from("bookings")
        .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
        .eq("id", existingAttempt.booking_id)
        .maybeSingle();

      if (existingBooking) {
        return NextResponse.json(buildResponse(requestId, existingBooking, existingAttempt, idempotencyKey, idempotencyKeySource, true));
      }
    }

    // Check for existing booking with same idempotency key
    const { data: existingBooking } = await admin
      .from("bookings")
      .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
      .eq("profile_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    let booking = existingBooking;

    if (!booking) {
      const { data: newBooking, error: bookingError } = await admin
        .from("bookings")
        .insert({
          profile_id: user.id,
          court_id: courtId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          timezone,
          status: "awaiting_payment",
          payment_status: "pending",
          subtotal_cents: subtotalCents,
          discount_cents: discountCents,
          tax_cents: taxCents,
          total_cents: totalCents ?? subtotalCents,
          platform_fee_cents: platformFeeCents,
          currency,
          idempotency_key: idempotencyKey,
          booked_for_name: bookedForName,
          booked_for_phone: bookedForPhone ?? null,
          notes: notes ?? null,
          source: "api",
          metadata: {
            payment_scaffold: { placeholder: true, request_id: requestId },
          },
        })
        .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
        .single();

      if (bookingError) {
        if (bookingError.message.includes("bookings_no_overlap")) {
          return NextResponse.json({ error: "booking_conflict", message: "This slot is no longer available." }, { status: 409 });
        }
        return NextResponse.json({ error: "booking_create_failed", message: bookingError.message }, { status: 500 });
      }
      booking = newBooking;
    }

    if (!booking) {
      return NextResponse.json({ error: "booking_create_failed", message: "Unable to resolve booking state." }, { status: 500 });
    }

    const providerReference = booking.provider_checkout_session_id ?? placeholderCheckoutReference(booking.id);
    const { data: paymentAttempt, error: attemptError } = await admin
      .from("booking_payment_attempts")
      .upsert({
        booking_id: booking.id,
        profile_id: user.id,
        provider: "stripe",
        idempotency_key: providerIdempotencyKey,
        amount_cents: totalCents ?? subtotalCents,
        currency: booking.currency,
        status: "created",
        external_reference: providerReference,
        response_payload: { placeholder: true, request_id: requestId },
      }, { onConflict: "provider,idempotency_key" })
      .select("id, booking_id, status, amount_cents, currency, external_reference")
      .single();

    if (attemptError || !paymentAttempt) {
      return NextResponse.json({ error: "payment_attempt_create_failed", message: attemptError?.message ?? "Unknown error" }, { status: 500 });
    }

    return NextResponse.json(buildResponse(requestId, booking, paymentAttempt, idempotencyKey, idempotencyKeySource, false));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}

function buildResponse(
  requestId: string,
  booking: { id: string; status: string; payment_status: string; total_cents: number; currency: string },
  paymentAttempt: { id: string; booking_id: string; status: string; amount_cents: number; currency: string; external_reference: string | null },
  idempotencyKey: string,
  idempotencyKeySource: string,
  replayed: boolean,
) {
  return {
    requestId,
    bookingId: booking.id,
    status: booking.status,
    paymentStatus: booking.payment_status,
    amountCents: booking.total_cents,
    currency: booking.currency,
    idempotencyKey,
    idempotencyKeySource,
    replayed,
    providerReference: paymentAttempt.external_reference,
    mode: "placeholder",
  };
}
