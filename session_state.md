# GGX Corporate — Session State

**Last updated:** 2026-05-31
**Current phase:** Service-layer UI migration (Roadmap step 3 — "Migrate UI consumers to service layer").

## Completed (this task)
- **BulkUploadSummary → bulkUploadService.** Replaced the direct `getSessionUploads()` import from `data/bulkUploads` with `bulkUploadService.getBulkUploadById(id)`.
  - Batch date now loads into state via `useEffect` (default kept as the prior fallback `'2026-05-19 10:30 AM'`); `useState`/`useEffect` were already imported.
  - `data/bulkUploads` now has **no direct page importers** — only `bulkUploadService` reads it.
- Untouched in this page (no service exists / out of scope): `DROPOFF_LOCATIONS` (`data/dropoffLocations`), `isBillingAccount` (`data/paymentAccounts`), `RECEPTACLE_SIZES` (`data/bulkTemplate`).

## Migration status (overall)
- **Migrated:** Transactions, TransactionDetails, Dashboard (recent-tx + SLA card), SubAccounts (list + managers), SubAccountSettings, UsersPermissions, BulkUploader, Notifications page + RootLayout bell, Claims, SLA Alerts, Reports, Earnings + Settlement Detail, Support Tickets + detail, DataAnalytics, ParentDashboard, **BulkUploadSummary**.
- **Remaining (service exists):** RootLayout topbar search (cross-domain: `data/transactions` + `data/claims` + `data/supportTickets`); AuthContext (`DEMO_USERS` → `authService`, do last — session-critical).
- **No service yet (deferred):** PaymentSettings (`data/financialSecurity`), ServiceAdvisories (`data/serviceAdvisories`), bulk helpers (`data/bulkTemplate`, `data/dropoffLocations`, `data/paymentAccounts`).
- **Intentional `data/*` stays (not data access):** `useNotificationViewer`/`CATEGORY_META` (notifications hook/config); `SUBACCOUNT_OPTIONS` presentation options in Claims/Reports/SlaAlerts; SubAccountContext infra imports.

## Files changed (this task)
- `src/app/pages/BulkUploadSummary.tsx` (import swap + state/effect for batch date)
- `MOCK_SERVICE_LAYER.md` (§5 + §6 status rows)
- `session_state.md` (this file, new)

## Key decisions
- Used existing `getBulkUploadById()` (no new service method needed). It merges seed records, a superset of `getSessionUploads()`. For the canonical mock batch id the resolved `uploadedAt` equals the old fallback string, so visible behavior is preserved. Keeping the default state value identical to the old fallback preserves the unknown-batch case too.

## Validation
- `npm run build` (tsc -b + vite build) passes — 0 TS errors. Main bundle ~639 kB; DataAnalytics chunk ~432 kB (pre-existing >500 kB warning only).

## Repo notes
- `.claude/CLAUDE.md` is untracked (session-management protocol) — leave as-is unless asked.
- Previous task (ParentDashboard) already committed as `f85cf9e`. This task's changes are uncommitted (user commits manually).

## Next recommended task
**RootLayout topbar search** — migrate the cross-domain shell search off direct `data/transactions` / `data/claims` / `data/supportTickets` reads onto `transactionService` / `claimsService` / `ticketsService` (load each into state + filter locally). It's the last non-auth consumer; touches the app shell, so do it as its own focused pass. Leave AuthContext for last (pairs with real backend).
