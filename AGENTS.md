# GGX Corporate - Codex Instructions

> **Sync note:** This file and `.claude/CLAUDE.md` are intentionally similar.
> `AGENTS.md` is Codex's discovery file; `.claude/CLAUDE.md` is Claude's.
> If one changes, check whether the other needs the same update. The documentation
> index is `docs/README.md`.

## What This Project Is

GGX Corporate is a **business dashboard** for GoGo Xpress Business+ corporate and
bulk logistics users: companies, sellers, merchants, and account managers. It
supports bulk delivery operations, transactions, analytics, subaccounts, billing,
integrations, support, add-ons, commerce, and operational requests.

**This is not an individual customer booking app.** All core workflows are
bulk-first.

## Token-Efficient Read Strategy

1. Infer the task type before reading files.
2. Read compact docs first: `docs/session_state.md`, `docs/roadmap.md`, then the
   relevant `docs/context/*` file.
3. Use targeted reads over broad repo exploration.
4. Do not read `docs/archive/*` unless resolving history or contradictions.
5. Do not inspect source code unless the task requires implementation, validation,
   or resolving a documentation contradiction.

| Task type | Primary docs |
|---|---|
| Resuming work | `docs/session_state.md`, `docs/context/current-state.md` |
| Planning priorities | `docs/roadmap.md` |
| Backend/service work | `docs/context/backend-integration.md`, `docs/service_layer_rules.md` |
| Product/account UX | `docs/product_rules.md`, `docs/account_model.md` |
| Add-ons/module access | `docs/context/business-plus-addons.md` |
| Commerce/storefront/inventory | `docs/context/commerce-workflows.md` |
| Bulk booking/spreadsheet | `docs/context/bulk-booking.md` |
| UI/component polish | `docs/context/ui-components.md`, `docs/design_system_rules.md` |
| Documentation cleanup | `docs/README.md` |

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
