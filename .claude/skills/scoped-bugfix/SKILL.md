---
name: scoped-bugfix
description: Use this skill for focused bugs with known expected behavior, including wrong state, missing UI after refresh, scope mismatch, or a broken narrow workflow. Do not use for broad refactors, speculative redesigns, roadmap planning, or feature discovery.
---

# Scoped Bugfix

## Goal

Fix the smallest confirmed defect without changing adjacent behavior.

## Procedure

1. Identify the expected behavior from the prompt and relevant context doc.
2. If the affected file/component is unknown, do a locator/scout pass first.
3. If known, inspect only the necessary source and service contracts.
4. Confirm whether the bug is presentation, state, service, or scope-related.
5. Patch the minimal root cause.
6. Run focused verification appropriate to the source change.
7. Report files changed, behavior changed, validation, and remaining risks.

## Guardrails

- No broad refactors.
- Preserve existing behavior outside the bug.
- Keep account/subaccount scope intact.
- Do not move business-critical computation into the frontend.
- Do not update docs unless a rule, roadmap, or session state changed.
