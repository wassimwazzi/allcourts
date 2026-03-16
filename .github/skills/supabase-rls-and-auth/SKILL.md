---
name: supabase-rls-and-auth
description: Use for Supabase auth, Postgres schema, and row-level security changes that control who can read or mutate data.
---

# Supabase RLS and Auth

Use this skill when designing or changing Supabase Auth flows, profile ownership, Postgres policies, facility access, or any data access rule enforced with row-level security.

## Use this skill to
- keep authorization rules relational, explicit, and explainable
- map each auth user to one profile row and scope ownership through database policy
- separate self-service client actions from privileged service actions
- avoid broad write access to booking, payment, or audit data

## Guidance
- Map `profiles.id` to `auth.users.id` and treat client tokens as untrusted until RLS allows access.
- Model facility access explicitly through relational joins such as `facility_managers`.
- Review `SELECT`, `INSERT`, `UPDATE`, and `DELETE` separately for each protected table.
- Use helper functions for shared auth logic only when they stay narrow and easy to explain.
- Route privileged mutations through trusted backend or Edge Function paths.
- Keep payment tables and webhook receipts service-written.

## Checklist
- No policy grants generic authenticated write access to sensitive tables.
- Update policies use both `USING` and `WITH CHECK` where required.
- Public reads exist only when product requirements clearly justify them.
- Policies can each be explained in one sentence.

## Avoid
- role checks that live only in JWT metadata
- direct client writes to payment, reconciliation, or audit tables
- facility-wide access based on a loose profile role string
