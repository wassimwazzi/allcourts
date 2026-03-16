# Frontend AGENTS guide

This file applies to `frontend/*` unless a deeper `AGENTS.md` overrides it.

## Scope
- Keep frontend work centered on the bookings funnel: discover, compare, choose a slot, checkout, and confirm.
- Memberships are deferred. Do not introduce membership purchase flows, gated member-only UI, or entitlement copy unless explicitly requested.
- Keep web and mobile visually aligned, but do not force cross-platform component sharing when separate implementations are faster and clearer.

## Setup commands
- From the repo root: `pnpm install`
- Web dev: `pnpm --filter @allcourts/web dev`
- Mobile dev: `pnpm --filter @allcourts/mobile start`
- Workspace validation when relevant: `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Relevant files
- `frontend/web/app`, `frontend/web/src/components`, `frontend/web/src/data`, `frontend/web/src/lib`
- `frontend/mobile/app`, `frontend/mobile/components`, `frontend/mobile/data`
- Shared contracts and UI primitives in `packages/*`

## Frontend rules
- Lead with slot clarity, pricing, cancellation terms, and trust signals near the booking action.
- Design mobile-first and keep layouts scannable.
- Prefer accessible primitives, clear semantics, and obvious empty, loading, and error states.
- Keep copy short and action-oriented.
- Reuse shared types and validation whenever the same data crosses web, mobile, and backend boundaries.

## Validation
- After every frontend code change, run the relevant lint and typecheck command before handing off.
- Run the app-specific command for the area you changed.
- Use existing lint, build, and smoke-check paths only; do not add new frontend tooling just for validation.
- Check responsive behavior and booking-path clarity before closing a task.

## Security gotchas
- Do not leak server-only secrets into frontend code.
- Treat `NEXT_PUBLIC_*` values as public.
- Do not move pricing authority or auth decisions into the client for convenience.
