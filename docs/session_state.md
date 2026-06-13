# Session State - GGX Corporate

> Lightweight resume/checkpoint file. Detailed June 2026 history was archived to
> `docs/archive/session_log_2026-06.md`.

## Current State - Updated 2026-06-13

- **Stage:** Documentation cleanup and Claude skill routing completed; docs-only
  validation run, build not required.
- **Previous app stage:** GGX Business+ Session 54 - Storefront access fix and
  Inventory upsell polish.
- **Branch:** `master`.
- **Latest app commit before docs cleanup:** `2564363`.
- **Latest repo change:** this documentation cleanup / Claude skills commit.
- **Build status before docs cleanup:** green.
- **Push status:** not pushed.
- **Working tree note:** `.claude/settings.local.json` is local config; leave it
  alone unless explicitly asked.

## Most Recent Product Truth

- Account Add-ons and Integrations IA are decided. Account Add-ons lives under
  Account Management; Integrations stay separate.
- In-app Spreadsheet remains a secondary path under Bulk Upload; it has no sidebar
  item and is not a separate product.
- Inventory product attachment is grid-only for bulk booking. It uses the product
  picker when Inventory is enabled and does not deduct or reserve stock.
- Storefront now has demo checkout surfaces from later sessions: direct product
  checkout, session cart, cart review, and cart checkout. Real order placement,
  cart persistence, stock deduction/reservation, and final fee/payment contracts
  remain backend-owned.
- Item Protection fee and location-based delivery rate computation remain deferred
  to backend/BFF integration.

## Current Priority

Backend integration remains the next major app stage:

1. Auth/session hydration.
2. Transactions and claims.
3. Everything else.

Swap mock service bodies for real BFF/fetch integration only as the final
production stage, after a BFF exists.

## Standing Constraints

- Keep the product bulk-first.
- Preserve Main Account/Subaccount/Manager scoping.
- Use GGX SHADCN/shared components and tokens first.
- Preserve Upload File behavior when touching spreadsheet booking.
- No new dependencies without explicit approval.
- No destructive git actions.
- Commit stable milestones; do not push unless explicitly asked.

## Documentation Risks

- The exact checkout route set and persistence details are documented from session
  notes, not re-verified against source during this Markdown-only cleanup.
- Some historical Figma notes remain archived and may not reflect current app
  state.
- Real BFF endpoint shapes are still provisional until backend contracts exist.
