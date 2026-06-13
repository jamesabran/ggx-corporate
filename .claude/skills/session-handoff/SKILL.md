---
name: session-handoff
description: Use this skill for lightweight session checkpoints after medium or large changes, context handoff, and resume-state updates. Do not use for tiny UI fixes, full historical logs, or roadmap reshaping.
---

# Session Handoff

## Goal

Capture enough state for the next session to resume quickly without re-reading
history.

## Procedure

1. Update `docs/session_state.md` only with current state, latest commit/build,
   changed behavior, next priority, constraints, and risks.
2. Move detailed history to `docs/archive/` when it grows beyond checkpoint size.
3. Include validation status and whether work was pushed.
4. Keep handoff notes concise and actionable.

## Guardrails

- Do not duplicate long session logs in the live checkpoint file.
- Do not update handoff for tiny UI fixes unless the session state truly changed.
- Preserve known blockers and risks clearly.
