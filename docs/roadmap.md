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
| High | Responsive / small-screen layout fixes | KPI overflow, trend clipping, SLA badge wrapping, table/card badge constraints at 1024-1280px. |
| High | Sidebar IA cleanup | Preserve grouped Operations, Analytics & Reports, Finance, Account Management, Integrations, System. Confirm if feature additions change IA. |
| Medium | In-app spreadsheet booking completion | Let spreadsheet-created orders confirm on the spreadsheet page instead of routing to a separate review page. Preserve Upload File behavior. |
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
| Item Protection fee | Add with fee summary and validation together; do not partially update fee math. |
| Location-based delivery rate computation | Requires richer fee estimate contract, ideally BFF `/fees/estimate` or equivalent. |
| Uploaded-file path adoption of `lib/bookingValidation` | Wait for real file parsing; retain template-specific coverage such as COD cap, duplicate Reference ID, and pouch size. |

## Completed Current-State Highlights

- Service layer migration is complete for non-config UI consumers; intentional
  exceptions are documented in `service_layer_rules.md`.
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

## Guardrails

- Keep Account Add-ons and Integrations separate.
- Do not introduce individual booking as a core GGX Corporate workflow.
- Preserve Upload File behavior while improving spreadsheet booking.
- Keep rates, fees, financial totals, eligibility, SLA, analytics totals, and
  operational decisions out of page-level frontend logic.
