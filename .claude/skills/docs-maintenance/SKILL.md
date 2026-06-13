---
name: docs-maintenance
description: Use this skill for Markdown-only cleanup, compact docs, contradiction fixes, archive moves, and documentation structure maintenance. Do not use for source-code changes, feature implementation, or speculative product decisions.
---

# Docs Maintenance

## Goal

Keep documentation compact, accurate, and token-efficient without lowering future
session quality.

## Procedure

1. Use existing repo docs as the source of truth.
2. Read compact docs first, then targeted rule/context docs.
3. Do not inspect source unless needed to resolve a doc contradiction.
4. Move old detailed history to `docs/archive/` instead of duplicating it.
5. Put feature/domain truth in `docs/context/`.
6. Put reusable procedures in `.claude/skills/*/SKILL.md`.
7. Do not leave empty templates.
8. List unresolved decisions as documentation risks.

## Guardrails

- Markdown-only tasks do not require a build.
- Avoid duplicating large content between context docs and skills.
- Keep always-loaded docs compact.
- Do not create feature-specific skills.
