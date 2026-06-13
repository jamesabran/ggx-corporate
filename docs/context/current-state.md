# Current State

Read this after `docs/session_state.md` when resuming work or checking the latest
project truth.

## Product State

- GGX Corporate is the repo/project, while user-facing product copy is moving
  toward GGX Business+.
- The app is a business logistics dashboard for bulk operations, not an individual
  customer booking app.
- Main Account, Subaccount, and Manager scoping are core product rules.
- Account Add-ons is the current discovery/activation surface for optional
  capabilities. The older "Business Modules" label is historical/internal.

## App State

- The latest app checkpoint before this documentation cleanup was Session 54:
  Storefront access fix and Inventory upsell polish.
- Build was green at commit `2564363`.
- Backend integration is the next major stage, but it is blocked until a real BFF
  exists.
- Mock/demo services remain the implementation substrate for current UI behavior.

## Standing Constraints

- Bulk booking stays primary.
- In-app Spreadsheet stays under Bulk Upload and has no sidebar item.
- Inventory product attachment in booking is grid-only and does not deduct or
  reserve stock.
- Storefront checkout/cart surfaces are demo/client-side until real order APIs
  exist.
- No frontend-owned authoritative rates, fees, financial totals, eligibility,
  SLA, analytics totals, stock deduction, or operational routing.

## Documentation Risks

- Some detailed historical notes are archived in `docs/archive/session_log_2026-06.md`.
- Exact frontend route/component details should be verified in source only when an
  implementation task needs them.
- BFF endpoint shapes remain provisional until backend contracts exist.
