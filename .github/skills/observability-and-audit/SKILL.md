---
name: observability-and-audit
description: Use for booking and payment systems that need durable audit trails, support visibility, and replayable operational evidence.
---

# Observability and Audit

Use this skill when adding state transitions, webhook handlers, support tooling, logs, or data models that should help operators reconstruct booking and payment behavior.

## Use this skill to
- record enough evidence to explain what happened in booking and payment flows
- keep support queries able to join booking, payment attempt, webhook, and audit history
- preserve failure context without storing secrets
- make replay and manual recovery safe when downstream processing fails

## Guidance
- Record booking state changes, payment attempt lifecycle, webhook receipts, and actor identity where relevant.
- Prefer append-only audit patterns for critical transitions.
- Keep important query keys in columns even when storing structured JSON payloads.
- Use explicit status values and indexed timestamps for operational tables.
- Mark ignored, failed, and processed events distinctly.
- Preserve money-adjacent rows through status changes instead of deletion.

## Operational expectations
- Log request IDs and idempotency keys when available.
- Keep webhook rows resumable for manual replay.
- Design data so support can trace a problem from booking through settlement evidence.
- Expose future facility-facing history through RLS-safe views or tables instead of ad hoc access.

## Avoid
- logs that omit identifiers needed for correlation
- deleting evidence after processing fails
- storing secrets just to make debugging easier
