# Mobile AGENTS guide

This file applies to `frontend/mobile/*` and overrides the higher-level frontend guide where needed.

## Primary goal
- Build an Expo mobile experience for fast booking intent: find a venue, compare the next slot, and move toward confirmation with minimal friction.
- Memberships are deferred. Do not add membership purchase or entitlement screens unless explicitly requested.

## Setup commands
- `cd /Users/wassimwazzi/dev/allcourts`
- `pnpm --filter @allcourts/mobile start`
- `pnpm --filter @allcourts/mobile web`
- `pnpm --filter @allcourts/mobile ios`
- `pnpm --filter @allcourts/mobile android`

## Key files and directories
- Router screens: `frontend/mobile/app`
- Shared mobile UI pieces: `frontend/mobile/components`
- Mock booking data: `frontend/mobile/data/mock.ts`
- Package config: `frontend/mobile/package.json`, `frontend/mobile/tsconfig.json`, `frontend/mobile/app.json`

## Coding rules
- Follow Expo Router file-based routing patterns already used in `app/(app)` and `app/booking/[id].tsx`.
- Keep interactions thumb-friendly and prioritize the next slot, price, and confidence signals.
- Use strict TypeScript and the `@/*` alias from `tsconfig.json`.
- Prefer native-feeling layouts over copying web structure too literally.
- Avoid heavy dependencies and architecture that the current mock-data flows do not need.

## Validation
- After every mobile code change, run both `pnpm --filter @allcourts/mobile lint` and `pnpm --filter @allcourts/mobile typecheck` before handing off.
- Run one of the existing Expo commands for the surface you touched.
- Manually sanity-check navigation, back behavior, loading fallbacks, and long text on smaller screens.

## Security gotchas
- Do not store secrets or privileged tokens in the app bundle.
- Assume mobile clients are untrusted for pricing, availability, and authorization decisions.
- Keep any payment-sensitive logic on the backend or in edge functions.
