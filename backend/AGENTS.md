# Backend AGENTS guide

This file applies to `backend/*` unless a deeper `AGENTS.md` overrides it.

## Scope
- Protect booking integrity first: availability, provisional booking, payment handoff, confirmation, cancellation, and auditability.
- Memberships are deferred. Do not add membership tables, entitlement checks, discount rules, or subscription billing unless a task explicitly asks for them.
- Keep future expansion possible, but do not let future features complicate the booking path today.

## Relevant files
- SQL source of truth: `backend/supabase/migrations`, `backend/supabase/seed.sql`
- Edge functions: `backend/functions/*`
- Shared helpers: `backend/functions/_shared/*`
- Product context: `README.md`, root `AGENTS.md`, shared packages in `packages/*`

## Working rules
- Treat Postgres constraints, indexes, and RLS as the enforcement layer for backend invariants.
- Keep booking status and payment status separate and explicit.
- Make money-adjacent writes idempotent and traceable.
- Prefer small, deterministic function handlers over large, stateful orchestration.
- Keep service-role access confined to backend code paths.

## Validation
- After backend TypeScript changes, run the relevant lint and typecheck command before handing off when scripts exist for that area.
- Review the exact schema or function path you changed and the replay or duplicate path that could follow it.
- For SQL changes, verify constraints, indexes, and seed compatibility.
- For edge function changes, verify request parsing, auth, idempotency, and error response behavior.
- Do not add new backend tooling just for validation if the repo does not already define it.

## Security gotchas
- Never trust client-supplied pricing, booking totals, or role claims.
- Verify webhook signatures before processing provider events.
- Keep secrets in environment variables only.
- Return client-safe payloads and avoid leaking service-role data or internal failure details.
