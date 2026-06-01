# Roadmap — GGX Corporate

> **Do not work on items in this file unless explicitly asked.**
> This is a reference for future sessions, not a work queue.

## Known UI / UX fixes

### Responsive layout
- KPI card values (e.g. ₱4,285,000) overflow card boundaries at narrow viewports — needs `min-w-0` / `truncate` or font scaling.
- "vs last month" trend badges on KPI cards clip at smaller widths — badge container needs `flex-shrink-0` or wrapping strategy.
- SLA alert badge pairs ("Breach SLA" / "No Movement" + subaccount chip) wrap and overflow row containers at narrow widths — constrain to single-line with `+N more` fallback.

### Sidebar reorganization
- Current flat nav list has no grouping or hierarchy.
- Group items by feature context: Operations, Analytics & Finance, Account, Support.
- Review sidebar IA after each major feature addition.
- See `docs/product_rules.md` for suggested groupings.

### Transactions — Batch view
- Batch seed data has only 1–2 transactions per batch (unrealistic). Batches should represent 50–500+ transactions.
- Remove or replace the note at the bottom of the Transactions page that implies individual booking is available — the app is bulk-upload only.
- Batch table columns are cluttered, especially the counters/summary section. Redesign for clarity: reduce visible columns, move secondary data to a secondary row or tooltip.
- Counter badges in batch rows need better visual treatment (alignment, spacing, sizing).

### Data Analytics scoping
- Main Account viewing a specific subaccount should see subaccount-specific analytics, not consolidated data.
- Managers logged into a subaccount context should see only that subaccount's analytics data.
- Current implementation may not fully scope the analytics charts/tables.

## Feature additions

### Operations Requests
- Add an "Operations Requests" section under Shipping Operations.
- Distinct from Support Tickets — these are proactive operational asks (pickup scheduling, address changes, route adjustments, priority handling).
- Do not merge with Support Tickets.
- See `docs/product_rules.md` for the Support Tickets vs Operations Requests distinction.

## Architecture / service layer

### Service layer completion
- Continue migrating any remaining direct `data/*` imports to service-layer calls in UI consumers.
- Remaining intentional exceptions: frontend config, presentation hooks, SubAccountContext infrastructure.

### Backend integration
- Next major stage: swap each service's mock body for real `fetch()` calls against the BFF.
- Starting point: auth (async session hydration; the sync localStorage shortcut in AuthContext is known technical debt).
- Dependency order: auth → transactions + claims → everything else.
- Ensure no business-critical math is owned by the frontend after integration.

### Figma alignment
- New reusable components added to code should be reflected in the Figma Design System file.
- Run an alignment pass when component library grows significantly.

## Completed (reference)

- Service layer migration: all non-config UI consumers go through service facades.
- Public tracking page `/track/:trackingNumber`.
- Transaction seed expanded to 25 rows (diverse statuses, both subaccounts).
- Dashboard KPI + performance card wired to live transaction seed.
- Claim detail page `/dashboard/claims/:id` with full status timeline.
- UX dead-end fixes: rating widget, proof-of-delivery modal, Share button, billing Pay Now, API key regeneration, Settings save states.
- Seed claims expanded to 8 (all 5 statuses).
