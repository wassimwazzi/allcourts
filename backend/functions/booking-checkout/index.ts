import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  empty,
  errorResponse,
  getIdempotencyKey,
  getRequestId,
  HttpError,
  json,
  methodNotAllowed,
  readJson,
} from "../_shared/http.ts";
import {
  type BookingCheckoutRequest,
  type BookingCheckoutResponse,
  getCheckoutEnvStatus,
  getCheckoutWarnings,
  normalizeBookingCheckoutRequest,
  placeholderCheckoutReference,
} from "../_shared/payments.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

type StoredBooking = {
  id: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  provider_payment_intent_id: string | null;
  provider_checkout_session_id: string | null;
};

type StoredPaymentAttempt = {
  id: string;
  booking_id: string;
  status: string;
  amount_cents: number;
  currency: string;
  external_reference: string | null;
};

function buildCheckoutResponse(
  requestId: string,
  booking: StoredBooking,
  paymentAttempt: StoredPaymentAttempt,
  idempotencyKey: string,
  idempotencyKeySource: "header" | "generated",
  replayed: boolean,
): BookingCheckoutResponse {
  const envStatus = getCheckoutEnvStatus();
  const providerReference = paymentAttempt.external_reference ?? placeholderCheckoutReference(booking.id);

  return {
    requestId,
    bookingId: booking.id,
    status: booking.status,
    paymentStatus: booking.payment_status,
    amountCents: booking.total_cents,
    currency: booking.currency,
    idempotencyKey,
    idempotencyKeySource,
    paymentProvider: "stripe",
    mode: "placeholder",
    replayed,
    providerReference,
    stripe: {
      publishableKeyConfigured: envStatus.publishableKeyConfigured,
      secretKeyConfigured: envStatus.secretKeyConfigured,
      webhookSecretConfigured: envStatus.webhookSecretConfigured,
      readyForProviderCall: envStatus.readyForProviderCall,
      readyForWebhookVerification: envStatus.readyForWebhookVerification,
      checkoutSessionCreated: Boolean(booking.provider_checkout_session_id),
      paymentIntentCreated: Boolean(booking.provider_payment_intent_id),
    },
    handoff: {
      nextAction: "Create a Stripe Checkout Session or PaymentIntent, persist the provider IDs, and return only client-safe checkout data.",
      notes: [
        "Resolve availability and authoritative pricing server-side before creating Stripe objects in production.",
        "Reuse the same idempotency key on retries so the original provisional booking and payment attempt are returned.",
        "Do not move the booking to confirmed until webhook or provider confirmation is processed durably.",
      ],
    },
    warnings: getCheckoutWarnings(idempotencyKeySource, envStatus),
  };
}

serve(async (request) => {
  const requestId = getRequestId(request);

  try {
    if (request.method === "OPTIONS") {
      return empty(204, { requestId });
    }

    if (request.method !== "POST") {
      return methodNotAllowed(["POST", "OPTIONS"], { requestId });
    }

    const user = await getAuthenticatedUser(request);
    const body = await readJson<BookingCheckoutRequest>(request);
    const normalized = normalizeBookingCheckoutRequest(body);
    const headerIdempotencyKey = getIdempotencyKey(request);
    const idempotencyKey = headerIdempotencyKey ?? `generated:${crypto.randomUUID()}`;
    const idempotencyKeySource: "header" | "generated" = headerIdempotencyKey ? "header" : "generated";
    const providerIdempotencyKey = `${user.id}:${idempotencyKey}`;
    const admin = createAdminClient();

    const { data: existingAttemptData, error: existingAttemptError } = await admin
      .from("booking_payment_attempts")
      .select("id, booking_id, status, amount_cents, currency, external_reference")
      .eq("provider", "stripe")
      .eq("profile_id", user.id)
      .eq("idempotency_key", providerIdempotencyKey)
      .maybeSingle();
    const existingAttempt = existingAttemptData as StoredPaymentAttempt | null;

    if (existingAttemptError) {
      throw new HttpError(500, "payment_attempt_lookup_failed", "Unable to load existing payment attempt.", {
        cause: existingAttemptError.message,
      });
    }

    if (existingAttempt) {
      const { data: existingBookingData, error: existingBookingError } = await admin
        .from("bookings")
        .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
        .eq("id", existingAttempt.booking_id)
        .maybeSingle();
      const existingBooking = existingBookingData as StoredBooking | null;

      if (existingBookingError) {
        throw new HttpError(500, "booking_lookup_failed", "Unable to load existing provisional booking.", {
          cause: existingBookingError.message,
        });
      }

      if (!existingBooking) {
        throw new HttpError(
          409,
          "orphaned_payment_attempt",
          "An idempotent payment attempt exists without a matching booking. Review the stored records before retrying.",
          { bookingId: existingAttempt.booking_id },
        );
      }

      return json(
        200,
        buildCheckoutResponse(requestId, existingBooking, existingAttempt, idempotencyKey, idempotencyKeySource, true),
        { requestId },
      );
    }

    const { data: existingBookingData, error: existingBookingError } = await admin
      .from("bookings")
      .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
      .eq("profile_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    const existingBooking = existingBookingData as StoredBooking | null;

    if (existingBookingError) {
      throw new HttpError(500, "booking_lookup_failed", "Unable to load existing provisional booking.", {
        cause: existingBookingError.message,
      });
    }

    const bookingPayload = {
      profile_id: user.id,
      court_id: normalized.courtId,
      booking_date: normalized.bookingDate,
      start_time: normalized.startTime,
      end_time: normalized.endTime,
      timezone: normalized.timezone,
      status: "awaiting_payment",
      payment_status: "pending",
      subtotal_cents: normalized.subtotalCents,
      discount_cents: normalized.discountCents,
      tax_cents: normalized.taxCents,
      total_cents: normalized.totalCents,
      platform_fee_cents: normalized.platformFeeCents,
      currency: normalized.currency,
      idempotency_key: idempotencyKey,
      booked_for_name: normalized.bookedForName,
      booked_for_phone: normalized.bookedForPhone,
      notes: normalized.notes,
      source: "api",
      metadata: {
        checkout_context: normalized.checkoutContext,
        payment_scaffold: {
          placeholder: true,
          request_id: requestId,
          idempotency_key: idempotencyKey,
          provider_idempotency_key: providerIdempotencyKey,
          idempotency_key_source: idempotencyKeySource,
          source_function: "booking-checkout",
        },
        warning: "Replace this placeholder with server-side availability resolution, pricing authority, and real Stripe object creation before production.",
      },
    };

    let booking = existingBooking;
    if (!booking) {
      const { data: bookingData, error: bookingError } = await admin
        .from("bookings")
        .insert(bookingPayload)
        .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
        .single();

      if (bookingError || !bookingData) {
        const message = bookingError?.message ?? "Unable to create provisional booking.";
        if (message.includes("bookings_no_overlap")) {
          throw new HttpError(409, "booking_conflict", "The requested court slot is no longer available.", {
            constraint: "bookings_no_overlap",
          });
        }

        const isIdempotencyConflict = bookingError?.code === "23505" &&
          message.includes("bookings_profile_id_idempotency_key_key");
        if (isIdempotencyConflict) {
          const { data: conflictedBookingData, error: conflictedBookingError } = await admin
            .from("bookings")
            .select("id, status, payment_status, total_cents, currency, provider_payment_intent_id, provider_checkout_session_id")
            .eq("profile_id", user.id)
            .eq("idempotency_key", idempotencyKey)
            .maybeSingle();

          if (conflictedBookingError) {
            throw new HttpError(500, "booking_lookup_failed", "Unable to load the conflicting provisional booking.", {
              cause: conflictedBookingError.message,
            });
          }

          booking = conflictedBookingData as StoredBooking | null;
        } else {
          throw new HttpError(500, "booking_create_failed", "Unable to create provisional booking.", {
            cause: message,
          });
        }
      } else {
        booking = bookingData as StoredBooking;
      }
    }

    if (!booking) {
      throw new HttpError(500, "booking_create_failed", "Unable to resolve provisional booking state after idempotency handling.");
    }

    const providerReference = booking.provider_checkout_session_id ?? placeholderCheckoutReference(booking.id);
    const { data: paymentAttemptData, error: attemptError } = await admin
      .from("booking_payment_attempts")
      .upsert({
        booking_id: booking.id,
        profile_id: user.id,
        provider: "stripe",
        idempotency_key: providerIdempotencyKey,
        amount_cents: normalized.totalCents,
        currency: booking.currency,
        status: "created",
        external_reference: providerReference,
        response_payload: {
          placeholder: true,
          request_id: requestId,
          idempotency_key: idempotencyKey,
          provider_idempotency_key: providerIdempotencyKey,
          provider_reference: providerReference,
          next_step: "Create Stripe Checkout Session or PaymentIntent here and persist the returned object IDs.",
        },
      }, {
        onConflict: "provider,idempotency_key",
      })
      .select("id, booking_id, status, amount_cents, currency, external_reference")
      .single();
    const paymentAttempt = paymentAttemptData as StoredPaymentAttempt | null;

    if (attemptError || !paymentAttempt) {
      throw new HttpError(500, "payment_attempt_create_failed", "Unable to persist the payment attempt scaffold.", {
        cause: attemptError?.message ?? null,
      });
    }

    return json(
      200,
      buildCheckoutResponse(requestId, booking, paymentAttempt, idempotencyKey, idempotencyKeySource, false),
      { requestId },
    );
  } catch (error) {
    return errorResponse(error, 500, requestId);
  }
});
