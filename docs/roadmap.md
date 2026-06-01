# Roadmap — GGX Corporate

> **Do not work on items in this file unless explicitly asked.**
> This is a reference for future sessions, not a work queue.

## Active priority

**Service-layer / backend integration cleanup** — this is the current active priority. All polish and feature items below are queued behind it unless stakeholders specifically reprioritize.

---

## Polish pass priority order (after active priority)

1. Responsive / small-screen layout fixes
2. Sidebar IA cleanup
3. Data Analytics scoping fix
4. Batch transactions UX cleanup
5. Operations Requests feature planning / implementation

---

## Known UI / UX fixes

### 1. Responsive / small-screen layout (HIGH VISIBILITY — do first in polish pass)

Reviewed on a smaller screen. Several issues are visible to stakeholders:

- **KPI card value overflow.** Large currency values (e.g. ₱4,285,000) overflow card boundaries at narrower desktop/laptop widths. Needs `min-w-0` / `truncate` or responsive font scaling.
- **KPI trend text clipping.** "vs last month" text and trend badges get cut off or cramped at smaller widths. Badge container needs `flex-shrink-0` or a wrapping-safe layout.
- **SLA alert row wrapping.** Badge pairs ("Breach SLA" / "No Movement" + subaccount name chip) wrap and overlap at narrow widths. Constrain to single-line with a `+N more` fallback pattern.
- **Dashboard card balance.** Cards should remain readable and visually balanced across smaller desktop/laptop widths (~1024px). Avoid breakage at 1024–1280px range specifically.
- **General badge overflow.** Any badge/chip inside a table row or card that can receive a long label must be constrained — use `truncate`, `max-w`, or `+N more` before allowing wrapping.

Implementation notes:
- Use `min-w-0` on flex children that hold variable-length text.
- Use `truncate` for tracking numbers, names, and amounts in constrained cells.
- Do not use fixed pixel widths on containers holding dynamic content.
- Test at 1024px, 1280px, and 1440px before marking done.

### 2. Sidebar information architecture cleanup (HIGH VISIBILITY — do second in polish pass)

Current sidebar is a flat list with no grouping, hierarchy, or role context.

Issues:
- No visual or semantic grouping between unrelated sections.
- Does not communicate feature relationships or admin vs manager access boundaries.
- Will become harder to navigate as features are added (e.g. Operations Requests).

Target grouping (plan this before implementing — confirm with product if needed):

```
Dashboard
Operations
  └ Transactions
  └ Bulk Upload
  └ Operations Requests  ← future
  └ Claims
  └ SLA Alerts
  └ Support Tickets
Analytics & Reports
  └ Analytics
  └ Reports
Finance
  └ Earnings
  └ Billing Statements
  └ Payment Settings
Account Management
  └ Subaccounts
  └ Users & Permissions
  └ Address Book
  └ API Integration
System
  └ Notifications
  └ Settings
```

Implementation notes:
- Admin users see all groups. Managers see only Operations, Analytics & Reports (scoped), and System.
- Group labels should be small, subdued, uppercase — not navigation links themselves.
- Do not make the sidebar feel heavy. Use compact group labels, not section headers.
- Plan alongside the Operations Requests module since it affects navigation structure.
- Review sidebar IA again after any major feature addition.

### 3. Data Analytics account scoping fix

Current state: the Data Analytics page may show data across all accounts even when the user context is scoped to a specific subaccount.

Expected scoping behavior:
- **Admin on Main Account (no subaccount selected):** sees consolidated analytics across all subaccounts.
- **Admin viewing a specific subaccount:** sees analytics scoped to that subaccount only — not consolidated.
- **Manager in a subaccount context:** sees only their assigned/current subaccount's analytics — charts, tables, KPI cards all scoped.

Pre-implementation checklist:
- Confirm whether `dataAnalyticsService` (or the current analytics service) accepts account/subaccount context parameters.
- If not, add context params before building UI scoping.
- Follow the existing role-scoping model in `docs/account_model.md`.
- Analytics totals and business-critical metrics must come from service/backend contracts — not page-level frontend computations.
- This is important for stakeholder review: wrong scoping misrepresents subaccount performance.

### 4. Bulk upload / batch transactions UX cleanup

Issues:
- **Unrealistic batch sizes.** Current batch seed data has only 1–2 transactions per batch. GGX Corporate is bulk-upload focused — batches should represent realistic operations: 50–500+ transactions per batch. Only use small batches if intentionally showing an edge case (e.g. a corrective re-upload).
- **Irrelevant individual booking note/CTA.** The Transactions page contains a note or CTA implying individual booking is available. This app is bulk-upload only — remove or replace with something relevant to bulk operations.
- **Cluttered batch list layout.** Current batch table columns are overcrowded, especially the counters section. Redesign for scannability: reduce primary visible columns, move secondary stats to a secondary row, tooltip, or expandable area.
- **Counter visual treatment.** Batch row counter badges need better alignment, spacing, and sizing — currently they compete visually and are hard to read at a glance.

Design direction:
- Lead with batch identity (ID, filename, upload date) and rollup status.
- Surface counts (total, delivered, in-progress, failed) in a compact, consistent format — not as separate badge columns.
- Actions (view summary, download) should be clearly separated from data columns.

---

## Feature additions

### 5. Operations Requests (future module)

**Purpose:** Allow corporate users to send logistics execution requests to the Operations team. These are not issue reports — they are fulfillment and coordination requests.

**Module name:** Operations Requests
**Placement:** Under the Operations group in the sidebar (see sidebar IA above).
**Do not merge with Support Tickets.** These are categorically different — see `docs/product_rules.md`.

**Request types (initial scope):**

_Supply requests:_
- Pouches
- Boxes
- Other packaging supplies

_Pickup support requests:_
- Immediate pickup
- Bulk pickup assistance
- Request 4-wheel pickup instead of 2-wheel first-mile
- Reschedule pickup
- Escalate missed pickup

_Operational assistance requests:_
- Special handling
- High-volume dispatch coordination
- Warehouse / branch coordination

**Form fields:**

Supply request: Subaccount, delivery address, supply type, quantity, needed-by date, notes.

Pickup support: Subaccount, related batch ID or upload session (optional), pickup address, request type, estimated shipment count, estimated total weight/volume (optional), preferred pickup window, notes.

**Statuses:** Submitted → In Review → Coordinating → Scheduled → Completed / Declined / Cancelled

**Role / account scoping:**
- Admin can create and view requests for all subaccounts; can filter by subaccount, type, and status.
- Manager can create and view requests only for their assigned/current subaccount.
- Consolidated request views (all subaccounts) are Admin-only in Main Account context.

**Architecture notes (before implementation):**
- Create `operationsRequestService` (or `opsRequestsService`) as the service-layer contract before any UI work.
- Frontend must not determine: operational feasibility, availability, assigned handler, official fulfillment status, or routing logic — those come from backend/BFF or operations source systems.
- Frontend handles: presentation logic, filtering, sorting, grouping, form completeness checks only.

**Priority:** Future feature — after the current cleanup/polish pass unless stakeholders specifically prioritize operational request workflows.

---

## Architecture / service layer

### Service layer completion
- Continue migrating any remaining direct `data/*` imports to service-layer calls in UI consumers.
- Remaining intentional exceptions: frontend config, presentation hooks, SubAccountContext infrastructure.

### Backend integration (active priority)
- Next major stage: swap each service's mock body for real `fetch()` calls against the BFF.
- Starting point: auth (async session hydration; the sync localStorage shortcut in AuthContext is known technical debt).
- Dependency order: auth → transactions + claims → everything else.
- Ensure no business-critical math is owned by the frontend after integration.
- Before implementing Data Analytics scoping: confirm `dataAnalyticsService` contract supports account/subaccount context params.
- Before implementing Operations Requests: establish `operationsRequestService` contract first.

### Figma alignment
- New reusable components added to code should be reflected in the Figma Design System file.
- Run an alignment pass when the component library grows significantly.

---

## Completed (reference)

- Service layer migration: all non-config UI consumers go through service facades.
- Public tracking page `/track/:trackingNumber`.
- Transaction seed expanded to 25 rows (diverse statuses, both subaccounts).
- Dashboard KPI + performance card wired to live transaction seed.
- Claim detail page `/dashboard/claims/:id` with full status timeline.
- UX dead-end fixes: rating widget, proof-of-delivery modal, Share button, billing Pay Now, API key regeneration, Settings save states.
- Seed claims expanded to 8 (all 5 statuses).
- Token-efficient project docs structure established (`docs/`).
