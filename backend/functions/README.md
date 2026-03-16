# AllCourts edge function payment scaffold

This directory contains a starter-only payment foundation for booking checkout and Stripe webhook receipt handling. It is intentionally incomplete: it creates durable placeholders and explicit contracts, but it does **not** create Stripe objects or verify Stripe signatures yet.

## `booking-checkout`

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>` required, `idempotency-key` strongly recommended, `x-request-id` optional
- **Body contract:** booking intent fields (`courtId`, `bookingDate`, `startTime`, `endTime`) plus amount fields in integer minor units
- **Current behavior:** creates or reuses a provisional `bookings` row and a matching `booking_payment_attempts` row for provider `stripe`
- **Idempotency behavior:** same authenticated user + same `idempotency-key` returns the original durable attempt when it already exists
- **Current non-goals:** server-side pricing authority, Stripe Checkout Session creation, Stripe PaymentIntent creation, booking confirmation

### Response shape highlights

- `requestId`: echo/correlation ID for logs and client retries
- `replayed`: `true` when the saved payment attempt was reused
- `providerReference`: placeholder checkout reference until a real Stripe object is persisted
- `stripe.readyForProviderCall`: `true` only when `STRIPE_SECRET_KEY` is configured
- `warnings`: explicit scaffold gaps for the next engineer

## `stripe-webhook`

- **Method:** `POST`
- **Headers:** `stripe-signature` expected once signature verification is implemented, `x-request-id` optional
- **Current behavior:** persists one durable receipt per `(provider, event_id)` before any business-state mutation
- **Replay behavior:** duplicate `event_id` returns the existing receipt instead of creating another row
- **Current non-goals:** cryptographic verification, event-to-booking reconciliation, state transitions

### Receipt status guide

- `received`: signature header exists and the webhook secret is configured, but verification is still placeholder-only
- `ignored`: receipt was stored, but processing was intentionally skipped because the webhook secret or signature is missing

## Environment expectations

| Variable | Needed now | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Admin client target for both functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Privileged writes for bookings, payment attempts, and webhook receipts |
| `STRIPE_SECRET_KEY` | Not yet | Required for future Checkout Session / PaymentIntent creation |
| `STRIPE_PUBLISHABLE_KEY` | Not yet | Required when returning client-safe Stripe configuration |
| `STRIPE_WEBHOOK_SECRET` | Not yet | Required for real Stripe signature verification |

## Handoff checklist

1. Replace client-supplied pricing with authoritative server-side pricing and availability resolution.
2. Create Stripe objects with the same idempotency key and persist returned object IDs immediately.
3. Verify Stripe webhook signatures with the Stripe SDK before trusting payload contents.
4. Make webhook processing resumable: `received -> processing -> processed/failed`.
5. Keep booking state and payment state transitions deterministic so retries and out-of-order webhooks remain safe.
