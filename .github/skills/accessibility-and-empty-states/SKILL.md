---
name: accessibility-and-empty-states
description: Use for UI states that need accessible interactions, readable structure, and useful empty or error handling.
---

# Accessibility and Empty States

Use this skill whenever a frontend change adds or modifies user-visible states such as loading, empty, error, permission, success, or disabled states.

## Use this skill to
- keep controls labeled, keyboard reachable, and visibly focused
- ensure headings, lists, forms, and landmarks remain semantic
- produce empty states that explain what happened and what to do next
- preserve user input and recovery paths when possible

## Accessibility baseline
- Give interactive controls clear labels and visible focus treatment.
- Use semantic structure so screen readers and keyboard users can navigate confidently.
- Maintain readable contrast and never rely on color alone for state.
- Keep touch targets comfortable on mobile.

## Empty state rules
- Explain the state in plain language.
- Offer a useful next action such as retrying, changing filters, or exploring nearby courts.
- Preserve entered filters or form data when possible.
- Distinguish no inventory, loading, error, and permission problems.

## Avoid
- generic system messages with no next step
- visual-only status communication
- clearing user input unless there is a strong reason
