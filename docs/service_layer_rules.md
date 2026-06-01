# Service Layer Rules — GGX Corporate

## Core principle

The service layer is the **backend integration seam**. Every service function is async, shaped around a future BFF API endpoint, and currently backed by static mock data. When real APIs land, only the service body changes — UI consumers stay the same.

## Import rules

- UI components and pages **must not import mock datasets directly** when a service abstraction exists.
- `data/*` modules are internal to the service layer. Pages should import from `services/*`, not `data/*`.
- Intentional exceptions (do not wrap in services):
  - Frontend config: `data/bulkTemplate` (CSV columns, template generator, receptacle sizes)
  - Presentation hooks/config: `useNotificationViewer`, `CATEGORY_META`, `SUBACCOUNT_OPTIONS`
  - Context infrastructure: `SubAccountContext` imports from `data/accounts`, `data/runtimeAccounts`

## Page responsibilities

- Pages are responsible for **orchestration and layout** — loading data from services into state, rendering components, handling user events.
- Pages must not own business logic, financial math, or eligibility rules.
- Extract reusable logic into hooks (`src/app/hooks/`), services (`src/app/services/`), or utilities — not into page files.

## Business logic boundary

- **No business-critical math in the frontend.** The frontend must not be the source of truth for: rates, fees, surcharges, fuel charges, SLA hit/miss, claim approval amounts, refund values, earnings, settlement totals, delivery efficiency, RTS rate, billing balances, or any other financial/operational value.
- These values are owned by source systems (FTX, OMS, Cashinator, etc.) and delivered via the BFF as precomputed fields.
- Frontend may do **presentation logic only**: filtering, sorting, grouping, formatting, UI counts, permission-based show/hide, form completeness checks.

## Service function conventions

- All data-returning service functions are `async` — even when currently returning mock data synchronously.
- Function names map to future BFF endpoints (see JSDoc in each service file).
- Filters, search, and sort applied in services are presentation-layer conveniences over mock data — in production, these become query params on the real API call.

## Adding a new service

1. Create `src/app/services/[domain]Service.ts`.
2. Import from `src/app/data/[domain].ts` internally.
3. Re-export types and presentation config needed by UI consumers.
4. Document the future BFF endpoint in JSDoc.
5. Update any UI consumers to import from the service, not the data module.

## Future service contracts (establish before UI work)

- **Data Analytics scoping:** Before implementing per-subaccount analytics scoping in the UI, confirm whether `dataAnalyticsService` (or the current analytics service) accepts account/subaccount context parameters. Add context params to the service contract first if missing.
- **Operations Requests:** Before any UI implementation of the Operations Requests module, create `operationsRequestService` (or `opsRequestsService`) as the service-layer contract. The frontend must not determine operational feasibility, handler assignment, fulfillment status, or routing — those belong to backend/BFF or operations source systems.

## Migration status

All non-config UI consumers have been migrated to the service layer. Remaining direct `data/*` reads are intentional (see exceptions above). The next stage is replacing mock service bodies with real `fetch()` calls — starting with auth.
