# Supabase schema AGENTS guide

This file applies to `backend/supabase/*` and overrides the higher-level backend guide where needed.

## Primary goal
- Keep the database schema authoritative for booking correctness, auth boundaries, and payment traceability.
- Memberships are deferred. Do not add membership schema or RLS complexity unless explicitly requested.

## Current repo reality
- This directory contains SQL migrations and seed data, but no checked-in `supabase.toml` project config yet.
- Treat the SQL files in this folder as the source of truth.
- Do not assume local `supabase start` or `supabase db reset` is available from this repo without additional project setup.

## Key files
- Migrations: `backend/supabase/migrations/*.sql`
- Seed data: `backend/supabase/seed.sql`
- Important booking invariant: `bookings_no_overlap` in the initial migration

## Schema rules
- Keep SQL additive and rollback-aware where possible.
- Preserve explicit booking and payment status fields rather than collapsing them into one state column.
- Use constraints, partial indexes, triggers, and helper functions to enforce invariants close to the data.
- Use JSONB only for bounded extension data, not core booking facts.
- Placeholder teams and competitions may remain, but do not expand them instead of finishing bookings-first work.

## Validation
- Re-read the full migration in order after editing it.
- Make sure seed rows still match table definitions, constraints, and enum-like checks.
- Check that new auth or access rules are explicit and narrow.
- Confirm membership-related flags remain deferred unless the task specifically changes that scope.

## Security gotchas
- Avoid broad `authenticated` write access.
- Keep facility management access tied to clear ownership or manager records.
- Do not rely on frontend filtering for authorization.
- Preserve auditability for payments, webhook receipts, refunds, and booking changes.
