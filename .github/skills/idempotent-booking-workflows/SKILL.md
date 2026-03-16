---
name: idempotent-booking-workflows
description: Use for booking, checkout, and webhook flows that must safely handle retries without duplicate reservations or charges.
---

# Idempotent Booking Workflows

Use this skill when implementing booking creation, checkout initiation, payment retries, webhook processing, or any workflow where the same request may arrive more than once.

## Use this skill to
- prevent duplicate reservations and duplicate charges
- return the original durable result on safe retries
- make conflicts explicit when the retried request no longer matches saved intent
- keep retries observable in logs, audit rows, and operational tables

## Guidance
- Require an idempotency key for money-adjacent requests.
- Define scope explicitly, usually user plus booking intent or provider plus event ID.
- Put unique constraints behind idempotency guarantees.
- Use deterministic state transitions so replays cannot drift.
- Persist provisional rows before external provider calls when that improves recovery.
- Keep payment attempts separate from bookings so retries stay visible.

## Failure handling
- If inventory is gone, return a conflict instead of creating another pending booking.
- If a provider call times out after a local write, reuse the saved attempt on retry.
- If a webhook replays, acknowledge it and skip duplicate side effects.
- If state is inconsistent, mark it for review instead of guessing.

## Avoid
- application-only duplicate protection with no database constraint
- creating a second booking because a network retry looked new
- hiding recovery paths for partial failures
