---
name: small-ui-polish
description: Use this skill for button size or variant changes, spacing, alignment, responsive polish, density, hover states, and shadcn/GGX styling cleanup. Do not use for service logic, data scoping, feature behavior changes, or large redesigns.
---

# Small UI Polish

## Goal

Make a narrow visual or interaction polish pass using existing GGX components and
tokens.

## Procedure

1. Read `docs/context/ui-components.md`.
2. Locate the affected component/page. If unknown, do a quick locator pass.
3. Prefer existing shared components, variants, tokens, and established patterns.
4. Keep edits local to the visible issue.
5. Verify responsive behavior when the polish can affect layout.
6. Report files changed, visible behavior, validation, and risks.

## Guardrails

- Avoid service/data/account logic unless the UI defect depends on it.
- Do not create a new reusable component unless reuse is real.
- Do not update docs after tiny UI fixes unless rules or roadmap changed.
- Keep hover, disabled, loading, empty, and responsive states coherent when touched.
