# Edge functions AGENTS guide

This file applies to `backend/functions/*` and overrides the higher-level backend guide where needed.

## Primary goal
- Implement privileged booking and payment workflows as small, deterministic Supabase Edge Functions.
- Memberships are deferred. Do not add membership purchase, discount, or entitlement logic unless explicitly requested.

## Current repo reality
- `backend/functions` is a Supabase Edge Functions subtree, not a normal pnpm package.
- The checked-in runbook is `backend/functions/README.md`.
- Do not treat the root `pnpm dev:functions` script as the authoritative workflow for this directory until a real package exists here.

## Key files
- Shared HTTP helpers: `backend/functions/_shared/http.ts`
- Shared env and payment helpers: `backend/functions/_shared/env.ts`, `backend/functions/_shared/payments.ts`
- Supabase auth helper: `backend/functions/_shared/supabase.ts`
- Checkout handler: `backend/functions/booking-checkout/index.ts`
- Webhook handler: `backend/functions/stripe-webhook/index.ts`

## Function rules
- Keep request parsing, auth, idempotency, and response formatting explicit.
- Reuse shared helpers for CORS, request IDs, bearer token parsing, and error responses.
- Persist durable records before side effects when handling checkout or webhooks.
- Keep booking state transitions and payment state transitions separate.
- Return machine-readable errors and client-safe payloads only.

## Validation
- After every edge-function code change, run the relevant lint and typecheck command for the touched package or workspace before handing off.
- Trace both the first-request path and the replay or duplicate path.
- For checkout changes, verify `idempotency-key`, bearer auth, and provisional booking behavior.
- For webhook changes, verify receipt persistence happens before any business-state mutation.
- Use the README handoff checklist as a guardrail for what is intentionally still placeholder behavior.

## Security gotchas
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET`.
- Do not trust webhook payloads until signature verification is implemented.
- Do not let the client define final prices or booking confirmation state.
- Keep raw provider payloads and correlation IDs available for audits without leaking them to clients.
