---
name: stripe-marketplace
description: Use for payment and settlement work that should stay compatible with Stripe marketplace patterns and future platform fees.
---

# Stripe Marketplace

Use this skill when designing or modifying payment flows, Stripe integrations, settlement data, webhook handling, or future marketplace payout capabilities.

## Use this skill to
- keep payment models ready for platform fees, connected accounts, and payouts
- preserve durable links between internal records and Stripe objects
- keep asynchronous payment state driven by verified webhooks
- return only client-safe Stripe data to frontend callers

## Guidance
- Record currency and minor-unit amounts on every payment-related row.
- Persist Stripe object references immediately after creation.
- Keep the platform fee explicit instead of hiding it inside subtotal math.
- Create payment intents or checkout sessions server-side only.
- Validate pricing on the backend before contacting Stripe.
- Verify webhook signatures, persist receipts first, then process them.
- Make webhook handlers replay-safe and independent of event order.

## Model for extension
- leave room for connected account identifiers
- store application fee context explicitly
- separate booking attempts, webhook receipts, and settlement state
- keep refunds, disputes, and payout holds queryable if complexity grows

## Avoid
- trusting client-calculated totals
- assuming webhook delivery order
- collapsing operational traces into one opaque payment status field
