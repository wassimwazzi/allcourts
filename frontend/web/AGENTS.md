# Web AGENTS guide

This file applies to `frontend/web/*` and overrides the higher-level frontend guide where needed.

## Primary goal
- Build a polished Next.js App Router experience that helps users find a court and book quickly.
- Keep facility and admin views focused on bookings, occupancy, check-ins, and schedule interventions.
- Membership UI is out of scope unless a task explicitly calls for it.

## Setup commands
- `cd /Users/wassimwazzi/dev/allcourts`
- `pnpm --filter @allcourts/web dev`
- `pnpm --filter @allcourts/web build`
- `pnpm --filter @allcourts/web lint`

## Key files and directories
- Routes: `frontend/web/app`
- Components: `frontend/web/src/components`
- Static booking content: `frontend/web/src/data/foundation.ts`
- Public env helpers: `frontend/web/src/lib/env.ts`
- Package config: `frontend/web/package.json`, `frontend/web/tsconfig.json`

## Coding rules
- Use server components by default; add client components only when interaction requires them.
- Use the `@/*` import alias defined in `tsconfig.json`.
- Favor semantic HTML, accessible labels, and stable page structure before abstraction.
- Match the current visual direction: 21st.dev-inspired hierarchy, strong CTAs, clean spacing, and booking-first scanning.
- Keep admin pages operational, not back-office heavy.

## Validation
- After every web code change, run both `pnpm --filter @allcourts/web lint` and `pnpm --filter @allcourts/web typecheck` before handing off.
- Run `pnpm --filter @allcourts/web build` for route or component changes.
- Run `pnpm --filter @allcourts/web lint` for TSX or Next.js changes.
- Smoke-check affected routes such as `/`, `/discover`, `/checkout`, and `/admin` when those areas change.

## Security gotchas
- Only expose public browser-safe values through `NEXT_PUBLIC_*`.
- Do not embed service-role credentials, Stripe secrets, or private Supabase keys in web code.
- Do not trust client-rendered pricing as the final booking amount.
