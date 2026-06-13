# Roadmap - GGX Corporate

> Do not work on items in this file unless explicitly asked. This is a reference
> for future sessions, not an automatic work queue.

## Active Priority

**Service-layer / backend integration cleanup** is the current active priority.
All polish and feature work stays behind it unless stakeholders reprioritize.

Production integration order:

1. Auth and async session hydration.
2. Transactions and claims.
3. Remaining services.

`Swap mock services for real BFF/fetch integration` must remain the final,
deferred production-only stage. Start it only when a BFF/backend exists.

## Current Backlog

| Priority | Item | Notes |
|---|---|---|
| Medium | Custom Reports saved template persistence | Backend-owned persistence for user-defined report templates. |
| Medium | Custom Reports scheduled exports | Backend-owned scheduling and delivery channel support. |
| Low | Figma/component alignment pass | Reflect new reusable components in the Figma DS when the component library changes materially. |

## Deferred Production-Only Items

These require backend/BFF contracts and should not be implemented as frontend-only
source-of-truth logic.

| Item | Why deferred |
|---|---|
| Real storefront/cart order placement API | Checkout currently completes as demo/in-page state. Needs `POST /orders` or equivalent. |
| Cart persistence | Current cart is session-only. Persist only via localStorage or backend session once the order contract exists. |
| Backend stock deduction/reservation | Frontend must not own authoritative stock mutation for confirmed orders/bookings. |
| Authoritative final checkout fee/payment contracts | COD amount, shipping fees, payment terms, and final order totals must come from backend contracts. |
| Item Protection fee (authoritative) | Spreadsheet shows a frontend estimate (`max(declaredValue − 500, 0) × 1%`). Final authoritative fee, BFF contract, and validation must ship together; do not replace the estimate with partial backend math. |
| Location-based delivery rate computation | Requires richer fee estimate contract, ideally BFF `/fees/estimate` or equivalent. |
| Uploaded-file path adoption of `lib/bookingValidation` | Wait for real file parsing; retain template-specific coverage such as COD cap, duplicate Reference ID, and pouch size. |

## Completed Current-State Highlights

- Service layer migration is complete for non-config UI consumers; intentional
  exceptions are documented in `service_layer_rules.md`.
- Sidebar IA cleanup is complete: grouped Operations, Analytics & Reports, Finance,
  Account Management (with Add-ons), Integrations, and System are all in place;
  Commerce group appears conditionally when Inventory/Storefront are enabled.
- In-app spreadsheet booking is complete: orders created from the spreadsheet
  confirm inline (no separate review page). Upload File behavior is preserved.
- Account Add-ons replaced the old Business Modules discovery surface.
- Inventory, Storefront, On-Demand, Advanced Analytics, Custom Reports, and
  Consolidated Billing have module/access rules.
- Inventory CRUD/import/export and spreadsheet product attachment are implemented
  in demo/mock state.
- Storefront profile/product management, public storefront browsing, direct demo
  checkout, session cart, cart review, and cart checkout are implemented in
  demo/mock state.
- Data Analytics, Transactions, Claims, SLA Alerts, and Operations Requests
  scoping fixes are complete.
- Operations Requests is implemented and audited; per-id access enforcement
  remains a backend concern.
- GGX Business+ user-facing rebrand pass is complete where documented; internal
  package/route identifiers remain stable.
- Responsive layout QA pass is complete at 375px, 768px, 1024px, 1280px, and
  1440px across Dashboard, SLA Alerts, Transactions, Bulk Upload, Reports, Storefront,
  and Billing. Confirmed fixes: Reports CTA truncation on mobile, SLA Alerts header
  stack at sub-xl widths, Billing KPI grid 2-col at 1024px.

## Guardrails

- Keep Account Add-ons and Integrations separate.
- Do not introduce individual booking as a core GGX Corporate workflow.
- Preserve Upload File behavior while improving spreadsheet booking.
- Keep rates, fees, financial totals, eligibility, SLA, analytics totals, and
  operational decisions out of page-level frontend logic.
