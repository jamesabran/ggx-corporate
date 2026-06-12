# GGX Corporate — Documentation Index

## How to use this directory

Open only the docs you need for the current task. Do not load all docs by default.

---

## Agent entry points (root)

| File | For |
|---|---|
| `AGENTS.md` | Codex and general agents |
| `.claude/CLAUDE.md` | Claude (mirrors AGENTS.md; see sync note below) |

**Sync note:** `AGENTS.md` and `.claude/CLAUDE.md` are intentionally similar.
`AGENTS.md` is Codex's discovery file; `.claude/CLAUDE.md` is Claude's.
If one changes (rules, read strategy, commit rules), check whether the other needs the same update.

---

## Canonical current-state docs

| File | When to read |
|---|---|
| `session_state.md` | Resuming prior work — current state + last commit |
| `roadmap.md` | Planning next steps — active stage + backlog |

These two files are the source of truth for what has been done and what comes next.
Update `session_state.md` at natural checkpoints during long sessions.

---

## Rule docs (always current)

| File | Topic |
|---|---|
| `product_rules.md` | Product / UX decisions and constraints |
| `account_model.md` | Account, subaccount, and permission logic |
| `service_layer_rules.md` | Service layer architecture and import rules |
| `design_system_rules.md` | Component usage, DS conventions |
| `business_plus_modules.md` | Account Add-ons catalog master spec |
| `contract_module_rules.md` | Add-on access status and CTA logic |
| `feature_enablement_rules.md` | Feature enablement model |
| `service_type_rules.md` | Service type definitions (Standard/Same-Day/On-Demand) |
| `commerce_rules.md` | Commerce platform (Inventory + Storefront) rules |
| `inventory_rules.md` | Inventory module rules |
| `storefront_rules.md` | Storefront module rules |
| `spreadsheet_booking_rules.md` | In-app spreadsheet booking grid rules |
| `token_pipeline.md` | Design token pipeline (tokens.json → code + Figma) |

---

## Archive (`docs/archive/`)

Historical snapshots from the May 2026 build era. They are **read-only context** —
do not update them, and do not treat them as current state.

| File | What it was |
|---|---|
| `session_state.md` | May 31 session state (superseded by canonical `docs/session_state.md`) |
| `ROADMAP.md` | May 31 roadmap (superseded by `docs/roadmap.md`) |
| `PROJECT_HANDOFF.md` | May 31 handoff checkpoint |
| `PROJECT_CHECKPOINT.md` | May 29 checkpoint (self-declared superseded) |
| `IMPLEMENTATION_LOG.md` | May 29 initial build log |
| `MOCK_SERVICE_LAYER.md` | May 31 service layer architecture notes |
| `GGX_CORPORATE_APP_STRUCTURE.md` | May 29 directory tree snapshot |
| `GGX_CORPORATE_DS_CONTEXT.md` | May 29 Figma DS audit |
| `DS_USAGE_GUIDE.md` | May 29 color token / DS usage reference |

---

## How to update docs

- **After each session:** update `session_state.md` with what changed and the commit hash.
- **When behavior changes:** update the relevant rule doc (not just session_state).
- **When roadmap items complete:** update `roadmap.md` status column.
- **Never update archive files** — they are historical records.
- **Do not add new canonical docs to root** — root is for agent entry points only.
