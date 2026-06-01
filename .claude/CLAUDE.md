# GGX Corporate — Claude Instructions

## What this project is

GGX Corporate is a **business dashboard** for GoGo Xpress corporate and bulk logistics users — companies, sellers, merchants, and account managers. It supports bulk delivery operations, transactions, analytics, subaccounts, billing, integrations, support, and operational requests.

**This is not an individual customer booking app.** All workflows are bulk-first.

## Read strategy

1. Read this file first.
2. Open only the docs needed for the current task — do not load all docs by default.
3. Prefer `docs/session_state.md`, `docs/roadmap.md`, and targeted files over re-reading the full codebase.
4. Avoid broad audits unless the task requires them.

| Task type | Docs to open |
|---|---|
| Product / UX work | `docs/product_rules.md` |
| Account or permission logic | `docs/account_model.md` |
| Service / data layer work | `docs/service_layer_rules.md` |
| Component / design work | `docs/design_system_rules.md` |
| Resuming prior work | `docs/session_state.md` |
| Planning next steps | `docs/roadmap.md` |

## Permanent rules

**Product**
- Treat GGX Corporate as bulk-first. Do not introduce individual booking language or flows unless explicitly requested.
- Preserve account/subaccount scope. Main Account sees consolidated data. Subaccounts and managers viewing subaccounts see scoped data only.
- Use "Subaccount" (one word). Use "Accounts" not "Workspace."

**Frontend / architecture**
- Do not put business-critical computation in the frontend. Rates, fees, surcharges, eligibility, SLA, analytics totals, financial values, and operational rules must come from service/backend contracts.
- Prefer service-layer calls over direct mock data imports.
- Preserve existing behavior unless the task asks for a change. Avoid broad refactors unless required.

**Design system**
- Use the existing component library and design tokens first.
- If a new reusable custom component is needed, add it to the shared component library — not only inside a page or feature folder.
- When available, also add or update the matching component in the Figma Design System file using Figma MCP.
- Keep code and Figma aligned in naming, variants, states, layout behavior, and visual styling.

**Responses**
- Keep responses concise and task-focused.

## Session management

**During long or complex work**
- Update `docs/session_state.md` at natural checkpoints.
- Prepare handoff notes before context becomes overloaded (estimate ~75% full when: 20+ tool calls made, 5+ large files read, 3+ major task phases completed, or you find yourself re-summarizing earlier steps).
- When context is near the limit: stop, update `docs/session_state.md`, tell the user to start a new session.

**On session start**
- Check `docs/session_state.md`. If it exists, read it silently and confirm: "Resuming from previous session: [brief summary]."

**Agentic mode**
- Continue agentically through routine scoped tasks when the roadmap is clear.
- Commit completed changes directly after validation. Do not push unless explicitly instructed.
- Pause only for: serious blockers, destructive git actions, unclear product/business rules, or when the project is ready for the next major stage.

## Commit rules

- Use clear, scoped commit messages.
- Use multiple `-m` flags for multiline messages.
- Do not include `Co-Authored-By` trailers.
- Do not push to remote unless explicitly instructed.

## Response format (after completing a task)

1. **Done** — what was completed
2. **Files changed** — list of modified files
3. **Validation / docs review** — build result or review notes
4. **Commit hash** — the commit reference
5. **Notes / risks** — anything worth flagging
6. **Suggested next step** — one clear recommendation
