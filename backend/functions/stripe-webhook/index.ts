import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  empty,
  errorResponse,
  getRequestId,
  getTrimmedHeader,
  HttpError,
  json,
  methodNotAllowed,
  parseJsonObject,
  sha256Hex,
} from "../_shared/http.ts";
import {
  getWebhookEnvStatus,
  getWebhookVerificationState,
  type StripeWebhookResponse,
} from "../_shared/payments.ts";
import { createAdminClient } from "../_shared/supabase.ts";

type StoredWebhookEvent = {
  id: string;
  provider: string;
  event_id: string;
  event_type: string;
  status: string;
};

function buildWebhookResponse(
  requestId: string,
  eventRow: StoredWebhookEvent,
  payloadDigest: string,
  duplicate: boolean,
  verificationState: StripeWebhookResponse["verificationState"],
): StripeWebhookResponse {
  return {
    requestId,
    webhookEventId: eventRow.id,
    provider: "stripe",
    eventId: eventRow.event_id,
    eventType: eventRow.event_type,
    status: eventRow.status,
    duplicate,
    verified: false,
    verificationState,
    payloadDigest,
    handoff: {
      nextAction: "Verify the Stripe signature, map the event to booking/payment transitions, and move webhook_events.status through processing to processed atomically.",
      notes: [
        "Persist the raw Stripe event receipt before applying side effects.",
        "Treat duplicate provider event IDs as acknowledgements, not as a reason to re-run state transitions.",
        "Keep booking updates and payment-attempt updates deterministic so out-of-order webhook delivery remains safe.",
      ],
    },
    warnings: [
      "This scaffold stores receipt state but does not perform cryptographic Stripe signature verification yet.",
      verificationState === "secret_not_configured"
        ? "STRIPE_WEBHOOK_SECRET is not configured."
        : verificationState === "missing_signature"
          ? "stripe-signature header is missing."
          : "A stripe-signature header is present, but verification is still a placeholder until the Stripe SDK is wired in.",
    ],
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

    const rawPayload = await request.text();
    const payload = parseJsonObject(rawPayload);
    const payloadDigest = await sha256Hex(rawPayload);
    const stripeSignature = getTrimmedHeader(request, "stripe-signature");
    const envStatus = getWebhookEnvStatus();
    const verificationState = getWebhookVerificationState(envStatus.webhookSecretConfigured, Boolean(stripeSignature));
    const eventType = String(payload.type ?? getTrimmedHeader(request, "x-stripe-event-type") ?? "unknown");
    const eventId = String(payload.id ?? getTrimmedHeader(request, "x-stripe-event-id") ?? payloadDigest);
    const admin = createAdminClient();

    const { data: existingEventData, error: existingEventError } = await admin
      .from("webhook_events")
      .select("id, provider, event_id, event_type, status")
      .eq("provider", "stripe")
      .eq("event_id", eventId)
      .maybeSingle();
    const existingEvent = existingEventData as StoredWebhookEvent | null;

    if (existingEventError) {
      throw new HttpError(500, "webhook_event_lookup_failed", "Unable to look up an existing webhook event.", {
        cause: existingEventError.message,
      });
    }

    if (existingEvent) {
      return json(200, buildWebhookResponse(requestId, existingEvent, payloadDigest, true, verificationState), {
        requestId,
      });
    }

    const status = verificationState === "signature_present_not_verified" ? "received" : "ignored";
    const errorMessage = verificationState === "signature_present_not_verified"
      ? "Placeholder webhook receipt stored. Add Stripe SDK signature verification before trusting the payload."
      : verificationState === "missing_signature"
        ? "Missing stripe-signature header. Receipt stored without processing."
        : "STRIPE_WEBHOOK_SECRET is not configured. Receipt stored without processing.";

    const { data: eventRowData, error } = await admin
      .from("webhook_events")
      .insert({
        provider: "stripe",
        event_id: eventId,
        event_type: eventType,
        payload: {
          ...payload,
          _allcourts: {
            placeholder: true,
            request_id: requestId,
            payload_digest_sha256: payloadDigest,
            stripe_signature_present: Boolean(stripeSignature),
          },
        },
        status,
        error_message: errorMessage,
        processed_at: status === "ignored" ? new Date().toISOString() : null,
      })
      .select("id, provider, event_id, event_type, status")
      .single();
    const eventRow = eventRowData as StoredWebhookEvent | null;

    if (error || !eventRow) {
      throw new HttpError(500, "webhook_event_persist_failed", "Unable to persist webhook event.", {
        cause: error?.message ?? null,
      });
    }

    return json(202, buildWebhookResponse(requestId, eventRow, payloadDigest, false, verificationState), {
      requestId,
    });
  } catch (error) {
    return errorResponse(error, 500, requestId);
  }
});
