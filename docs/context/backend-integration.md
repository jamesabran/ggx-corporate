# Backend Integration Context

Use this for service-layer, BFF, fetch, auth, data contract, and production
integration work.

## Current State

- UI consumers should go through `services/*` rather than direct mock data imports
  when a service abstraction exists.
- Service functions are async and shaped around future BFF endpoints.
- Mock service bodies are temporary; UI contracts should survive the move to real
  fetch calls.

## Production Order

1. Auth and async session hydration.
2. Transactions and claims.
3. Remaining services.

`Swap mock services for real BFF/fetch integration` is the final deferred
production-only roadmap item. Do not start it until a BFF/backend exists.

## Boundaries

- Frontend may handle presentation filtering, sorting, grouping, formatting, UI
  counts, permission-based show/hide, and form completeness checks.
- Frontend must not own rates, fees, surcharges, fuel charges, SLA hit/miss,
  claim approval amounts, refund values, earnings, settlement totals, delivery
  efficiency, RTS rate, billing balances, stock deduction/reservation, or
  operational feasibility.
- Backend/BFF owns final financial values, eligibility, fulfillment status,
  service coverage, order placement, and stock mutation.

## Known Deferred Contracts

- `POST /orders` or equivalent for storefront/cart checkout.
- Cart persistence via backend session or approved local persistence.
- BFF fee estimate/finalization contract, including Item Protection and
  location-based rates.
- Uploaded-file parsing and validation contract.
- Per-id Operations Requests access enforcement.

## Implementation Guardrails

- Establish or adjust the service contract before changing UI behavior.
- Keep endpoint assumptions documented as provisional.
- Preserve account/subaccount scope in all service calls.
- Do not replace broad groups of mocks in one pass unless explicitly asked.
