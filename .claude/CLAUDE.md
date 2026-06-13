# GGX Corporate - Claude Instructions

> **Sync note:** This file and `AGENTS.md` are intentionally similar.
> `.claude/CLAUDE.md` is Claude's discovery file; `AGENTS.md` is for Codex and
> general agents. If one changes, check whether the other needs the same update.
> The documentation index is `docs/README.md`.

## What This Project Is

GGX Corporate is a **business dashboard** for GoGo Xpress Business+ corporate and
bulk logistics users: companies, sellers, merchants, and account managers. It
supports bulk delivery operations, transactions, analytics, subaccounts, billing,
integrations, support, add-ons, commerce, and operational requests.

**This is not an individual customer booking app.** All core workflows are
bulk-first.

## Token-Efficient Read Strategy

1. Infer the task type before reading files.
2. Load only one primary Claude skill unless the task clearly spans multiple
   types.
3. Read compact docs first: `docs/session_state.md`, `docs/roadmap.md`, then the
   relevant `docs/context/*` file.
4. Use targeted reads over broad repo exploration.
5. Do not read `docs/archive/*` unless resolving history or contradictions.
6. Do not inspect source code unless the task requires implementation,
   validation, or resolving a documentation contradiction.

| Task type | Primary skill | Primary docs |
|---|---|---|
| Focused bug | `.claude/skills/scoped-bugfix/SKILL.md` | Relevant `docs/context/*` |
| Small UI polish | `.claude/skills/small-ui-polish/SKILL.md` | `docs/context/ui-components.md` |
| UX flow change | `.claude/skills/ux-flow-change/SKILL.md` | Relevant `docs/context/*` |
| Docs cleanup | `.claude/skills/docs-maintenance/SKILL.md` | `docs/README.md` |
| Roadmap update | `.claude/skills/roadmap-update/SKILL.md` | `docs/roadmap.md` |
| Session handoff | `.claude/skills/session-handoff/SKILL.md` | `docs/session_state.md` |

## Short-Prompt Routing

- "fix button size", "make buttons primary", "align cards", "fix spacing" ->
  `small-ui-polish` + `docs/context/ui-components.md`
- "not showing", "wrong state", "broken after refresh", "scope mismatch" ->
  `scoped-bugfix` + relevant context doc
- "change flow", "improve UX", "update CTA behavior" -> `ux-flow-change` +
  relevant context doc
- "update docs", "fix docs contradiction" -> `docs-maintenance`
- "add to roadmap", "save for later", "mark deferred" -> `roadmap-update`
- "prepare handoff", "update session state" -> `session-handoff`

## Permanent Rules

**Product**
- Treat GGX Corporate as bulk-first. Do not introduce individual booking language
  or core flows unless explicitly requested.
- Preserve account/subaccount scope. Main Account sees consolidated data.
  Subaccounts and managers viewing subaccounts see scoped data only.
- Use "Subaccount" (one word). Use "Accounts" not "Workspace."

**Frontend / architecture**
- Do not put business-critical computation in the frontend. Rates, fees,
  surcharges, eligibility, SLA, analytics totals, financial values, and
  operational rules must come from service/backend contracts.
- Prefer service-layer calls over direct mock data imports.
- Preserve existing behavior unless the task asks for a change. Avoid broad
  refactors unless required.

**Design system**
- Use the existing component library and design tokens first.
- If a new reusable custom component is needed, add it to the shared component
  library, not only inside a page or feature folder.
- When available, also update the matching component in the Figma Design System
  file using Figma MCP.
- Keep code and Figma aligned in naming, variants, states, layout behavior, and
  visual styling.

## Token-Efficiency Rules

- For simple UI fixes, avoid service/data/account logic unless needed.
- If the affected file/component is unknown, do a locator/scout pass first.
- If the affected file/component is known, implement directly with narrow scope.
- Keep reports concise: files changed, behavior changed, risks, commit command.
- Do not update docs after tiny UI fixes unless rules, roadmap, or session state
  changed.
- Do not weaken QA: still run appropriate verification when source changes.
- Markdown-only tasks do not require a build.

## Session Management

**During long or complex work**
- Update `docs/session_state.md` at natural checkpoints.
- Prepare handoff notes before context becomes overloaded.
- When context is near the limit: stop, update `docs/session_state.md`, and tell
  the user to start a new session.

**On session start**
- Check `docs/session_state.md`. If it exists, read it silently and confirm:
  "Resuming from previous session: [brief summary]."

**Agentic mode**
- Continue agentically through routine scoped tasks when the roadmap is clear.
- Commit completed changes directly after validation. Do not push unless
  explicitly instructed.
- Pause only for serious blockers, destructive git actions, unclear
  product/business rules, or when the project is ready for the next major stage.

## Commit Rules

- Use clear, scoped commit messages.
- Use multiple `-m` flags for multiline messages.
- Do not include `Co-Authored-By` trailers.
- Do not push to remote unless explicitly instructed.

## Response Format After Completing A Task

1. **Done** - what was completed
2. **Files changed** - list of modified files
3. **Validation / docs review** - build result or review notes
4. **Commit hash** - the commit reference
5. **Notes / risks** - anything worth flagging
6. **Suggested next step** - one clear recommendation
