# Roadmap — GGX Corporate

> **Do not work on items in this file unless explicitly asked.**
> This is a reference for future sessions, not a work queue.

## Active priority

**Service-layer / backend integration cleanup** — this is the current active priority. All polish and feature items below are queued behind it unless stakeholders specifically reprioritize.

---

## GGX Business+ — Modular Platform (new stage, in progress)

The product is evolving from GGX Corporate into **GGX Business+**, a modular
business logistics + commerce platform. Master spec: `docs/business_plus_modules.md`
(+ `contract_module_rules.md`, `feature_enablement_rules.md`, `service_type_rules.md`,
`commerce_rules.md`, `inventory_rules.md`, `storefront_rules.md`,
`spreadsheet_booking_rules.md`).

**Foundation delivered (Session 35):**
- Service types (Standard / Same-Day / **On-Demand** as distinct types).
- Module catalog + contract/access **status** model + status-aware **CTA** logic
  (`businessModulesService`, single source of truth).
- Feature enablement model (Inventory / Storefront) + permission keys.
- Mock services: businessModules, featureEnablement, inventory, storefront.
- **Business Modules** discovery page + status-aware `ModuleCard`.
- `EnablementGate` locked states; basic **Inventory** and **Storefront** routes.
- Progressive-reveal sidebar: Business Modules entry + Commerce group when enabled.

**Done (Session 36):** renamed to **Account Add-ons** (curated catalog, under
Account Management), Business+ logo rebrand (login + header), UI-consistency pass
(no icon-by-H1, DS Tabs on Notifications), and the Bulk Booking **input-method
selector + in-app spreadsheet grid** with the shared `lib/bookingValidation`
pipeline (valid/invalid separation; books valid rows via the existing pipeline).

**Done (Session 37):** Upload File + Type in Spreadsheet feed ONE flow — shared
context, `source`-tagged record into the source-aware review/summary. Consolidated
Billing shows a passive "Requires Subaccounts" until enabled.

**Done (Session 38):** reworked the spreadsheet-entry UX — removed the heavy
selector; Bulk Upload keeps the upload/drop flow with a secondary "Use our in-app
spreadsheet" link to a focused entry page (`/bulk-uploader/spreadsheet`, no sidebar
item) with sender/schedule/mode context, GGX location cascade in the grid (shared
`LocationCascadeCells`), bottom-left Add row, live fee estimate (`lib/bookingFees`),
and a Confirm Booking Details section. Deduped the Download Template CTA.

**Done (Session 39):** promoted the spreadsheet CTA to a primary button; moved
service type to a **page-level** selector (Standard / Same-Day / **On-Demand** when
enabled for the scope) and removed the per-row Service type + Notes columns; widened
Product / SKU for a future multi-product summary; added an Inventory upsell teaser
(hidden once Inventory is enabled). Fixed `resolveModuleAccess` so feature-enabled
add-ons read as `enabled`.

**Deferred (next sessions, in order):**
1. ✅ **DONE (Session 43).** Inventory product attachment into spreadsheet rows —
   when Inventory is enabled for the scope, the Product/SKU cell opens a picker
   (`ProductAttachDialog`) to attach multiple products with per-product quantities
   (chip + "+N more" summary), auto-fills Qty (total items) + Declared value
   (subtotal), and validates stock live (clamp + inactive/deleted/over-stock
   flags) with no draft-stage deduction.
2. Adopt `lib/bookingValidation` in the uploaded-file path once real file parsing
   exists (parse → validateRows). The summary's template-specific correction
   validator (COD cap, duplicate Reference-ID, pouch size) is intentionally
   retained — unify only without losing that coverage.
3. ✅ **DONE (Session 44).** The shared review/summary is data-driven for
   spreadsheet batches — the entered valid rows are captured at submit
   (session-only `setSpreadsheetBatchRows`) and the summary renders the actual
   rows (recipient / mobile / location / product / qty / declared value / parcel
   size) instead of a count note. Falls back to the count note on a hard reload.
4. ✅ **DONE (Session 46).** Storefront product management UI + customer-facing
   surface — merchant can edit the store profile (`StorefrontProfileDialog`),
   select Inventory products (`StorefrontProductsDialog`), and publish/unpublish
   (persisted via `setStorefrontStatus`; unpublish keeps the pending-impact
   warning + never auto-cancels). New public browse-only page at **`/shop/:slug`**
   (`StorefrontPreview`) renders the store + active products with a disabled
   "Checkout coming soon" — **no checkout** built. Actions gated by `storefront.*`
   permissions + a concrete scope.
5. ✅ **DONE (Session 42).** Transactions filter recognizes **On-Demand** as a
   distinct service type — added a `serviceType` field (Standard / Same-Day /
   On-Demand) to the transactions model, a Service Type filter on the Transactions
   page, a distinguishing badge in the Type column, and the service type in the
   detail header. The legacy Express/Standard `type` column is unchanged.
6. ✅ **DONE (Session 45).** Dashboard **Basic Analytics** — a lightweight section
   (Bookings by Service Type + Daily Booking Volume) backed by a service-layer
   aggregate `getBasicAnalytics` (counts/groupings treated as backend-provided,
   scoped like `getDashboardStats`). Simple DS bars, no chart lib. Distinct from
   the gated Advanced Data Analytics module (efficiency/RTS/SLA).
7. ✅ **DONE (Session 45).** Inventory create/edit/import/export flows — service
   mutations (`createInventoryProduct` / `updateInventoryProduct` /
   `deleteInventoryProduct` / `importInventoryProducts`) over a session-mutable
   store; `ProductFormDialog` for add/edit, delete via `ConfirmDialog`, CSV
   paste-import (header-mapped) + CSV export download. Actions gated by
   `inventory.*` permissions (managers get create/edit, not delete/import/export)
   and require a concrete scope. Stock is a managed field here; booking-time
   deduction stays backend-owned.
8. ✅ **DONE (Session 47).** Real activation/request flows replace the mock
   acknowledge dialog. Self-enable add-ons (Inventory/Storefront/On-Demand) flip
   runtime feature enablement (→ Enabled / Open); approval & contract add-ons
   submit a **persisted request** (`moduleActivationService` + `data/moduleRequests`)
   that the catalog reflects as a disabled "Request submitted" + pending note (no
   duplicate submits). The dialog has confirm → submitting → success phases and
   refreshes the catalog. BFF-shaped contracts in place
   (`POST /accounts/:id/features/:fid/enable`, `POST /accounts/:id/module-requests`).
9. ✅ **DONE (Session 48).** Full GGX Business+ rebrand pass — user-facing product
   name + marketing copy moved to "GGX Business+" / "GoGo Xpress Business+" (Login
   hero + register panel + feature bullets, public TrackingPage brand/footer,
   Shopify install copy, financial-security email body, browser `<title>`).
   Internal BFF/architecture comments, seed company names/filenames, and
   package/route identifiers intentionally unchanged.

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

### 3. Data Analytics account scoping fix ✅ FIXED (2026-06-10)

Current state: **resolved.** Root cause: `DataAnalytics.tsx` derived scope only from `SubAccountContext` (the Admin switcher), ignoring `AuthContext.accountId` — so a manager (whose `currentAccount` stays `'main'`) fell into the Main Account branch and saw consolidated data. The service (`dataAnalyticsService`) already supported `subaccountId` context.

Fix: added a shared `useScopedAccountId()` hook (`src/app/hooks/useAccountScope.ts`) that combines auth role + subaccount view — managers are hard-scoped to `user.accountId`; admins get consolidated on Main Account and scoped when drilled into a subaccount. `DataAnalytics` now uses it for the analytics + claims + SLA fetches and for the scoped label/banner (banner's "Switch to Main Account" hint is admin-only). Build green.

**Follow-up — DONE (2026-06-10):** rolled `useScopedAccountId()` out to the standalone `Transactions`, `Claims`, and `SLA Alerts` pages too. Each now scopes data by role (managers hard-scoped) and derives its consolidated-view flag as `subAccountsEnabled && scopeId === undefined` (preserves admin/default-account UI behavior, hides the subaccount filter/column for managers). Transactions' flat list is now scoped at the service layer via `getTransactionsBySubaccountId`. Build green.

Originally affected two scenarios:

- **Main Account admin viewing a specific subaccount** — analytics show consolidated/all-account data instead of scoping to the selected subaccount.
- **Manager logged into a subaccount** — analytics show all-account data instead of only that manager's subaccount data.

Expected scoping behavior:
- **Admin on Main Account (no subaccount selected):** consolidated analytics across all subaccounts — correct.
- **Admin viewing a specific subaccount:** analytics scoped to that subaccount only.
- **Manager in a subaccount context:** analytics scoped to their assigned/current subaccount only — charts, tables, KPI cards all scoped.

Pre-implementation checklist:
- Audit `DataAnalytics.tsx` and its service calls — confirm whether the current service accepts account/subaccount context params.
- If `dataAnalyticsService` (or equivalent) does not support context filtering, add it before touching the UI.
- Pass the active subaccount ID from `SubAccountContext` into the analytics service call.
- Follow the role-scoping model in `docs/account_model.md`.
- Analytics totals and business-critical metrics must come from service/backend contracts — not page-level frontend computations.
- Wrong scoping actively misrepresents subaccount performance to stakeholders — treat this as high priority within the polish pass.

### 4. Storefront/Product Checkout future work

Storefront/Product Checkout maturity: current demo supports single-product checkout only. Future work includes a multi-product cart before checkout, checkout address mapping through the shared locations API cascade (province/city/district/barangay), cart persistence after the cart flow exists, and production hardening such as backend stock deduction/reservation.

Specific deferred items:

- **Multi-product cart before checkout** — a cart step is needed before single-session checkout. This is the main deferred feature.
- **Checkout address via shared locations API cascade** — product checkout address fields should reuse the shared province/city/barangay cascade used elsewhere in the app, not a free-text stub.
- **Cart persistence** — after the cart flow exists, persist cart state across sessions. This is a later cart maturity item, not the main deferred feature.
- **Backend stock deduction/reservation** — stock deduction at order placement remains backend future work.

Product checkout should remain described as demo-level until these items are implemented. All items are blocked on backend integration and are explicitly deferred.

### Old §4 — Bulk upload / batch transactions UX cleanup ✅ DONE (2026-06-10)

Resolved: (1) all 7 remaining single-item batches given realistic `reportedCounts` (67–423 tx); service rollup status now derives from `reportedCounts` when present. (2) Individual-booking copy was already gone (no match on Transactions). (3) Batch list is a card-based expandable list (not the old cramped table); counts redesigned. (4) The 4 competing colored badges replaced with a compact, consistent stat group (small colored dot + value + label) for Total/Delivered/Active/Failed, desktop + mobile; expanded list now notes "Showing N of {total}". Build green.

Original issues:
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

### 5. Operations Requests ✅ IMPLEMENTED + AUDITED (2026-06-10)

Audit vs spec: service contract (`opsRequestsService`), data types, all category/type labels, the 7 statuses, the no-frontend-feasibility rule, sidebar placement, and the detail view all match the spec. Two gaps found and fixed: (1) **list scope manager bug** — the list derived `scopeId` from `SubAccountContext` only, so a manager with `currentAccount='main'` saw all subaccounts' requests; now uses `useScopedAccountId()` (managers hard-scoped). (2) **missing form fields** — the create form omitted supply "Needed by" date (now required) and pickup "Preferred pickup window" (now collected); the data type + detail view already supported both. Build green. Remaining (backend-era): per-id detail access enforcement is a BFF concern.

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

### Deferred: Bulk Upload fee computation

Fee breakdown needs the following updates in a future pass:

- Remove **Fuel Surcharge** from the fee breakdown display.
- Add **Item Protection** fee with the label "Item Protection".
  - Formula: `itemProtection = max(declaredValue - 500, 0) * 0.01`
- Declared Value remains editable (already implemented in Session 52).
- Future pass should update the fee summary, fee validation, and relevant mock computation helpers (e.g. `lib/bookingFees.ts`).
- Do not implement Item Protection or fee computation changes without also updating the fee summary and validation.

### Deferred: In-app spreadsheet booking completion

Allow spreadsheet-created orders to be confirmed directly on the spreadsheet page using its existing Confirm Booking Details, booking summary, payment option, and fees sections. Avoid routing users to a separate Review details page for this flow. The spreadsheet page already has these elements and should become the complete confirmation flow.

### Deferred: Custom Reports — saved template persistence

Saved templates in Custom Reports are currently read-only presets (Weekly delivery summary, COD collections by subaccount, Failed & returned exceptions). The "Save template" button shows a brief flash but does not persist anything. Full persistence — saving a user-defined column + filter setup as a named template and recalling it across sessions — is backend-owned and deferred until the BFF integration stage.

### Deferred: Custom Reports — scheduled exports

The Custom Reports builder shows a note "Scheduled exports will be available in a future update." Scheduling is backend-owned (cron/job queue, delivery channel). Implement once the BFF integration stage provides the necessary scheduling endpoint.

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
- **This is the final roadmap item.** New roadmap items go above this section, not after. Start only when GGX Business+ moves from demo/mock state into a real production implementation.

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
