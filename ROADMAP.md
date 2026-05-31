# GGX Corporate — Roadmap & Backlog

**Last updated:** 2026-05-31 (service-migration pass)
**Status:** All five planned roadmap items are complete. UX fix pass complete (12 items). Mock service layer committed **and UI migration well advanced** — 11 services exist and most domain pages now read through them (Transactions, Dashboard, SubAccounts, Users, BulkUploader, Notifications, Claims, SLA, Reports, Earnings, Support Tickets). A handful of consumers remain on direct `data/*` reads (DataAnalytics, ParentDashboard, BulkUploadSummary, RootLayout search, AuthContext). This document records what shipped and defines the next planning horizon. Items under "Next planning horizon" are backlog — do not implement until promoted to the active task.

The GGX Corporate app remains frontend/mock-only (no backend). All shipped items are local/mock implementations; remaining foundations are scoped below.

---

## Completed roadmap (2026-05-30)

| # | Item | Type | Status |
|---|------|------|--------|
| 0 | Stable Subaccount IDs (foundational) | Data-model cleanup | ✅ Done |
| 1 | Financial Security / OTP Verification | Feature (mock) | ✅ Done |
| 2 | Claims & Cancellations | Feature (mock) | ✅ Done |
| 3 | SLA Alerts / Operations Monitoring | Feature (mock) | ✅ Done |
| 4 | Data Analytics Enhancements (Business Review redesign) | Redesign | ✅ Done |

### What each delivered
- **Stable Subaccount IDs** — canonical `{ id, name }` map (`data/accounts.ts`) + `getCurrentAccountId()` bridge in `SubAccountContext`. Notification visibility and the viewer key off `accountId` (name = display only); bulk-upload records/events and transaction `batch.accountId` carry canonical ids.
- **Financial Security / OTP** — reusable `OtpDialog` (mock `123456`, 6 digits) gating all parent-level Payment Settings actions (bank/payment add, edit, remove, set primary/default), required even for Admin. Functional add/set-default; financial controls hidden outside parent/main-account context. Each verified change records a mock attention-email event + security-log entry and pushes a parent-scoped notification.
- **Claims & Cancellations** — `data/claims.ts` + Claims page; file refund claims on undelivered transactions (linked to tracking number, id-scoped notifications) and cancel newly-booked transactions, surfaced from Transaction Details. Claims sidebar item.
- **SLA Alerts / Operations Monitoring** — `data/slaAlerts.ts` + SLA Alerts ops page; No Movement / Breach SLA alerts with hub/forwarder follow-ups (id-scoped notifications), follow-up/resolve actions. SLA Alerts sidebar item.
- **Data Analytics redesign** — rebuilt around Business Review (Zenith PH) metrics (Total/Fulfilled Orders, Delivery Efficiency, RTS Rate, SLA Hit/Miss, Returns, Claims summary, Amount Settled, volume by region, avg delivery days, returns by reason); removed peak-hours. recharts lazy-loaded into its own chunk (main bundle ~997 kB → ~570 kB).

---

## Current shipped feature set (frontend/mock)

- **Auth (mock):** hardcoded login (`max@email.com` / `!1234qwer`); no real session.
- **Dashboard:** standard / main-account / subaccount-aware views.
- **Transactions:** list + detail (`:id` lookup), batch/upload source linkage, claims & cancellation actions.
- **Bulk Upload:** header check → optional column mapping → fast/background processing → review (editable error rows, location cascade, item-protection fee, duplicate removal) → booking → success; account-scoped batch records/events.
- **Claims** and **SLA Alerts** operational pages.
- **Finance (parent-level):** Earnings, Billing Statements, Payment Settings (OTP-gated).
- **Notifications:** unified categorized model with account-scope visibility, tabbed Notifications page, bell popover, sidebar entry; Reports (accessible to Managers; finance types hidden in subaccount view), Service Advisories, Support Tickets (+ detail, mock Zendesk boundary).
- **Data Analytics:** Business Review metric set (lazy-loaded).
- **Subaccounts:** enable/request flows, account switcher; Users & Permissions (Admin/Manager model).
- **Address Book:** CRUD with live GGX pickup-location API cascade.
- **Settings**, **API Integration** (mock).

---

## Current mock / frontend-only limitations
- No backend/API: all data is in-memory module state or static mock; **state resets on full page reload** (uploads, claims, SLA follow-ups, notifications read-state, subaccount context, payment changes).
- Login is a hardcoded mock; **route guards exist** (ProtectedRoute/AdminRoute via AuthContext) but are frontend-only (no real session security). Two demo logins: Admin (`max@email.com`) and Manager (`manager@email.com`).
- No real roles/permissions service: roles are mock-backed from AuthContext. Manager-scoped visibility, nav hiding, and route guards are fully wired.
- OTP is mock (`123456`); attention-email events and the security/audit log have no browse UI yet.
- Zendesk integration is stubbed (single boundary); reports/analytics figures are largely curated mock; period/region filters are UI-only.
- Main JS bundle (~570 kB) is still marginally above Vite's 500 kB warning threshold after the recharts split.

---

## Remaining foundations (next planning horizon)

These are infrastructure foundations, not features. Recommended sequence:

| Order | Foundation | Why / Notes |
|-------|-----------|-------------|
| ~~1~~ | ~~Mock authentication + route guards~~ | ✅ **Done (2026-05-30)** — `AuthContext` (Admin/Manager demo users), `ProtectedRoute`/`AdminRoute`, role-aware nav + notification scoping, access-denied state. |
| ~~2~~ | ~~Persistence / localStorage~~ | ✅ **Done (2026-05-30)** — auth session, subaccount selection, notification read-state, claims, SLA, recent uploads persisted via `lib/storage`. |
| ~~2.5~~ | ~~Mock service layer (infrastructure)~~ | ✅ **Done (2026-05-31)** — async service facades (`services/*`) over existing mock data modules. Canonical account IDs locked. See `MOCK_SERVICE_LAYER.md`. |
| **3 (in progress)** | Migrate UI consumers to service layer | **Well advanced (2026-05-31).** 11 services exist; most domain pages migrated (transactions, dashboard, subaccounts, users, bulk upload, notifications, claims, SLA, reports, earnings, support tickets, **data analytics**). **Remaining:** ParentDashboard, BulkUploadSummary, RootLayout search (services exist for these), then AuthContext last. No-service-yet: service advisories, payment accounts, financial security. See `MOCK_SERVICE_LAYER.md` §5–§7. |
| **4** | Backend / API integration | Replace mock service adapters with real endpoints (auth, transactions, claims, SLA, notifications, analytics). Largest effort; depends on defined API contracts. |
| — | Secondary | Real notification/Zendesk APIs; real OTP delivery; roles/permissions beyond Admin/Manager; dark mode; further bundle code-splitting. |

### Recommended next implementation task: Finish the remaining service migrations (services already exist)
- ✅ DataAnalytics migrated (2026-05-31) → `claimsService` + `slaService`.
- **Next: ParentDashboard** (`data/slaAlerts` → `slaService.getSlaAlertsList()`; uses `SLA_TYPE_META`, re-exported by the service).
- Then **BulkUploadSummary** (`getSessionUploads` → `bulkUploadService`).
- The RootLayout topbar search is its own cross-domain pass (load tx/claims/tickets via their services into state + filter).
- Leave `authService`/AuthContext for **last** (session-critical; pairs with real backend).
- See `MOCK_SERVICE_LAYER.md` §6–§7 for the remaining-consumers table.
- No new features. No new services for the above (they already exist). Refactor-only; preserve behavior.

### Risks / assumptions
- **No backend yet:** service adapters return mock data; the swap to real endpoints happens at the adapter layer without touching pages.
- **Services now written + pages migrated:** claims, SLA alerts, reports, earnings/settlements, support tickets (all 2026-05-31). **Still no service (deferred):** service advisories, payment accounts, financial security — migrate those pages only after services exist.
- **Auth migration:** `AuthContext` currently uses `DEMO_USERS` inline; migrating it to `authService` is low-risk but should be done last (it's session-critical).

---

## Cross-cutting deferred items
- ~~recharts `DataAnalytics` lazy-load / code-split~~ — **Done (2026-05-30)**. recharts ships as a separate ~431 kB chunk; main bundle ~570 kB (still slightly above the 500 kB warning — optional further splitting).
- ~~Real auth + route guards~~ (done); ~~persistence/localStorage~~ (done); ~~mock service layer infrastructure~~ (done). Still deferred: real notification/Zendesk APIs; real OTP delivery; backend/API integration; dark mode.
