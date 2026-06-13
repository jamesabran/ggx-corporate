# Session State - GGX Corporate

> Lightweight resume/checkpoint file. Detailed June 2026 history was archived to
> `docs/archive/session_log_2026-06.md`.

## Current State - Updated 2026-06-14

- **Stage:** Basic User mobile demo complete and pushed.
- **Branch:** `feature/customer-segment-growth-demo` (pushed to `origin`).
- **Latest commit:** `72ba058` - design: revise Basic User mobile home to match GGX app visual language.
- **Build/typecheck status:** green (verified after `72ba058`).
- **Push status:** pushed — `origin/feature/customer-segment-growth-demo` is up to date.
- **Working tree note:** `.claude/settings.local.json` is local config; leave it
  alone unless explicitly asked. QA scripts/dirs are gitignored locally.

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
- Item Protection: the spreadsheet fee preview shows a frontend estimate
  (`max(declaredValue − 500, 0) × 1%`) as a conditional line item when any valid
  row has a declared value above ₱500. The booking confirmation dialog rolls it
  into the estimated total (not broken out separately). Authoritative Item
  Protection fee contract and location-based delivery rate computation remain
  deferred to backend/BFF integration.

- Custom Reports gating is done and the current UX flow is acceptable for now.
  Saved templates and scheduled exports remain deferred/backend-owned.
- Custom Reports now respects account context: the Subaccount column/filter only
  appears for Main Account view with Subaccounts enabled; On-Demand options and
  rows are hidden when On-Demand is not enabled for the active scope; templates
  are sanitized so unavailable columns/options cannot be reintroduced; CSV export
  matches applicable visible columns; and Subaccount filtering prefers canonical
  ID filtering.

## Most Recent Feature Work — Basic User Demo

- Route group `/basic` added as a standalone mobile-first demo layer (no auth
  gate, no Business+ sidebar). Entry point: `/basic`.
- `BasicLayout` — light blue app shell, GGX logo header (no "Basic" branding),
  5-tab bottom nav (Home / Rewards / Ship / Transactions / Account).
- `BasicDashboard` — GGX app-aligned: bold welcome, service tiles (2×2 large),
  horizontal Explore-more row, activity card (COD + shipment stats), recent
  orders below fold.
- `GrowingNudgeCard` — promo-banner style matching GGX app carousel: gradient
  left panel + star icon + bold text + CTA link + pagination dots.
- `HVMNudge` page — "You may qualify for special business pricing" with benefit
  list, 3-step process, Request review and Talk to Sales CTAs with demo success
  states.
- `BasicSegmentContext` — `basic | growing` demo-only state (default: `growing`
  so nudge shows on first load). Change default in context to demo `basic` state.
- No auth gate, no backend calls — all mock/static. Safe to remove the whole
  `/basic` route group without touching Business+ dashboard.

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
