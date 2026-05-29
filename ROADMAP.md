# GGX Corporate — Roadmap & Backlog

**Last updated:** 2026-05-30
**Status:** All five planned roadmap items are complete. This document now records what shipped and defines the next planning horizon (foundations). Items under "Next planning horizon" are backlog — do not implement until promoted to the active task.

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
- **Notifications:** unified categorized model with account-scope visibility, tabbed Notifications page, bell popover, sidebar entry; Reports, Service Advisories, Support Tickets (+ detail, mock Zendesk boundary).
- **Data Analytics:** Business Review metric set (lazy-loaded).
- **Subaccounts:** enable/request flows, account switcher; Users & Permissions (Admin/Manager model).
- **Address Book:** CRUD with live GGX pickup-location API cascade.
- **Settings**, **API Integration** (mock).

---

## Current mock / frontend-only limitations
- No backend/API: all data is in-memory module state or static mock; **state resets on full page reload** (uploads, claims, SLA follow-ups, notifications read-state, subaccount context, payment changes).
- Login is a hardcoded mock; **no real authentication and no route guards** — any `/dashboard/*` URL is reachable directly.
- No real roles/permissions: the demo user is always the Admin. Manager-scoped notification visibility is implemented but not triggered (no Manager login).
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
| **3 (next)** | Backend / API integration | Replace mock data modules with real endpoints (auth, transactions, claims, SLA, notifications, analytics). Largest effort; depends on defined API contracts. |
| — | Secondary | Real notification/Zendesk APIs; real OTP delivery; roles/permissions beyond Admin/Manager; dark mode; further bundle code-splitting. |

### Recommended next implementation task: Authentication + Route Guards
- Introduce an auth/session context (mock-backed initially) exposing `isAuthenticated`, current user/role, login/logout.
- Wrap `/dashboard/*` in a `ProtectedRoute` (or loader/guard) that redirects unauthenticated users to `/`.
- Wire the existing mock login to set the session; wire logout (topbar) to clear it.
- Keep it frontend/mock (no backend yet) but structure the boundary so a real auth API drops in cleanly.

### Why auth + route guards before persistence
1. **Persistence scope depends on identity.** Persisted state should be keyed to the authenticated user/account; building persistence first would mean re-keying it once auth lands.
2. **Security correctness.** Open routes are the bigger real-world gap; guards make the app behave like a real product and make role/account context authoritative.
3. **Foundation for the session boundary.** Auth establishes the single source of truth (current user/role/account) that persistence, real APIs, and notification scoping all consume — avoiding rework.
4. **Lower risk, self-contained.** A guard + auth context is a contained change; persistence touches many modules and is cleaner once the identity boundary exists.

### Risks / assumptions
- **No backend yet:** auth will be mock-backed; treat the auth context as the seam for a future real provider. Avoid storing secrets; the mock credential check stays until a backend exists.
- **Reload behavior:** until persistence lands, a mock session may itself reset on reload unless a lightweight `localStorage` session flag is added with auth (acceptable, but note it blurs the auth/persistence line — keep session storage minimal).
- **Role model:** current Admin/Manager scoping is name/id-based mock; real auth should populate role + account id from the session so existing visibility logic keeps working unchanged.
- **Route coverage:** ensure all `/dashboard/*` children (including lazy `analytics`) sit behind the guard; the login route stays public.

---

## Cross-cutting deferred items
- ~~recharts `DataAnalytics` lazy-load / code-split~~ — **Done (2026-05-30)**. recharts ships as a separate ~431 kB chunk; main bundle ~570 kB (still slightly above the 500 kB warning — optional further splitting).
- Real auth + route guards (next); persistence/localStorage; real notification/Zendesk APIs; backend/API integration; dark mode.
