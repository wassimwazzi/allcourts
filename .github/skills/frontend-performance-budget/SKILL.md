---
name: frontend-performance-budget
description: Use for frontend decisions that affect rendering cost, bundle weight, responsiveness, or perceived speed.
---

# Frontend Performance Budget

Use this skill when adding dependencies, client components, images, animations, state management, or any feature that could affect speed on web or mobile.

## Use this skill to
- treat performance as a product constraint instead of a cleanup task
- keep first paint, first interaction, and list scrolling responsive
- choose simpler implementations when they preserve the same user value
- challenge decorative weight that does not help conversion or trust

## Guidance
- Treat every dependency, client component, image, and animation as a cost.
- Default to server rendering when it materially improves perceived speed.
- Keep above-the-fold content lightweight and avoid blocking first interaction.
- Delay heavy client state or abstractions until complexity proves the need.
- Design lean mobile screens with stable layouts and predictable transitions.
- Prefer loading states that reassure users quickly on weak networks.

## Review questions
- Does this change slow first paint, first interaction, or scrolling?
- Can the same outcome be achieved with less JavaScript or fewer abstractions?
- Is the shipped polish helping booking conversion, or just adding weight?
