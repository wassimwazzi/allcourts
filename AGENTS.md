# AllCourts AGENTS guide

This file is the repository-wide default for coding agents.

## Precedence
- Use `AGENTS.md` files, not the legacy `frontend/agents` or `backend/agents` folders, as the authoritative instruction source.
- Nested `AGENTS.md` files override this file for their subtree.
- When instructions conflict, follow the nearest `AGENTS.md` to the file you are editing.

## Current product scope
- Build AllCourts as a bookings-first marketplace.
- Optimize for discovery, availability, checkout, confirmation, and day-of operations.
- Memberships are deferred. Do not add membership plans, entitlement logic, recurring access rules, or membership UI unless a task explicitly asks for them.
- Teams, leagues, and competitions may appear as placeholders in the schema or copy, but they are not the launch priority.

## Repo map
- `frontend/web`: Next.js App Router marketing and facility-facing web surfaces.
- `frontend/mobile`: Expo Router mobile booking flows.
- `backend/supabase`: SQL schema, constraints, RLS, and seed data.
- `backend/functions`: Supabase Edge Functions for privileged flows and webhook handling.
- `packages/types`, `packages/validation`, `packages/sdk`, `packages/ui-web`, `packages/config`: shared contracts and foundations.

## Git workflow
After every completed feature or task:
1. Create a `feature/<kebab-name>` branch off `main` if not already on one.
2. Commit all changes with a descriptive message following conventional commits (`feat:`, `fix:`, `chore:`, etc.) and always include the Co-authored-by trailer.
3. Push the branch: `git push origin feature/<kebab-name>`.
4. Open a PR against `main` using `gh pr create --base main --title "..." --body "..."`.
5. Never push directly to `main`.

## Setup commands
- `pnpm install`
- `pnpm dev:web`
- `pnpm dev:mobile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Use only scripts that already exist. If a package does not expose a script for the validation you want, do not add new tooling just for a small task.

## Shared implementation rules
- Put shared types and validation in `packages/*` before wiring the same contract into multiple apps.
- Keep booking state and payment state separate.
- Prefer simple, composable abstractions over framework-heavy indirection.
- Make auth and authorization explicit. Supabase schema, constraints, and RLS are the source of truth for backend access.
- Keep currency in integer minor units and record the currency code anywhere money is stored or moved.
- Preserve request IDs, idempotency keys, and audit trails for money-adjacent flows.

## Design principles
- **Simplicity first.** Show only what the user needs to act. Remove fields, labels, and UI elements that do not directly help the user make a decision.
- **Fewer elements is better.** When in doubt, leave it out.
- **One clear primary action per card or screen.** Avoid offering many choices at once — pick the most important one and make it prominent.
- **Clarity over completeness.** A user understanding 80% of the information quickly is better than them understanding 100% slowly.

## Validation expectations
- Validate the smallest relevant surface for the files you changed.
- After every code change, run the relevant lint and typecheck command before handing off.
- For web changes, prefer the package-level build or lint command.
- For mobile changes, run the existing Expo command used by that app for a smoke check.
- For backend changes, review schema, function behavior, and any idempotency or auth edge cases touched by the change.
- For docs-only changes, verify file presence, internal consistency, and that the guidance matches the current repo layout.
- **For UI/component changes: Always use playwright-cli to visually inspect new components and pages.** Open the page at `http://localhost:3000`, take screenshots, and verify the design looks correct before completing the task. **Always delete screenshot files with `rm` immediately after validation** — never commit or leave screenshots in the repo.

## Security and safety
- Never trust client-supplied pricing, availability, or authorization decisions.
- Never commit secrets. Keep provider keys and service-role credentials in environment variables only.
- Verify webhook signatures before trusting payload contents.
- Avoid broad write access for authenticated users; prefer explicit, narrow policies and privileged server paths.
- Return only client-safe data from web pages, mobile screens, and edge functions.
