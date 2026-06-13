---
name: ux-flow-change
description: Use this skill for approved UX behavior or flow changes, CTA states, empty/loading/error states, copy consistency, and interaction sequencing. Do not use for unapproved product direction, broad IA rewrites, or pure visual spacing fixes.
---

# UX Flow Change

## Goal

Implement a scoped, approved behavior change while preserving product rules and
service boundaries.

## Procedure

1. Read the relevant context doc and product/account rules.
2. Confirm the current flow shape before editing.
3. Identify affected CTA, state, copy, and empty/loading/error cases.
4. Keep business rules in services/backend-shaped contracts.
5. Patch the narrow flow.
6. Verify the happy path and touched edge states.
7. Report behavior changed, files changed, validation, and risks.

## Guardrails

- Preserve bulk-first language and Account/Subaccount scoping.
- Do not invent missing product decisions; list them as risks.
- Avoid broad IA changes unless the prompt explicitly asks for them.
- Keep copy consistent with current GGX Business+ terminology.
