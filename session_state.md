# GGX Corporate — Session State

**Last updated:** 2026-05-31
**Current phase:** Service-layer UI migration (Roadmap step 3 — "Migrate UI consumers to service layer"). **Only AuthContext remains.**

## Completed (recent tasks)
- **RootLayout topbar search → services** (commit pending this session). Cross-domain shell search now sources its three lists from `transactionService.getTransactions()`, `claimsService.getClaimsList()`, `ticketsService.getTicketsList()`, loaded into state and refreshed on `location.pathname` change. Local filtering (tracking + recipient for tx; id + trackingNumber for claims/tickets) unchanged. `data/transactions`, `data/claims`, `data/supportTickets` now have **no direct page/layout importers** — only their services read them.
- **BulkUploadSummary → bulkUploadService** (commit `5e8aa61`). Replaced `getSessionUploads()` with `bulkUploadService.getBulkUploadById(id)`; batch date loads into state, fallback `'2026-05-19 10:30 AM'` preserved. `data/bulkUploads` now has no direct page importers.

## Migration status (overall)
- **Migrated:** Transactions, TransactionDetails, Dashboard (recent-tx + SLA card), SubAccounts (list + managers), SubAccountSettings, UsersPermissions, BulkUploader, Notifications page + RootLayout bell, Claims, SLA Alerts, Reports, Earnings + Settlement Detail, Support Tickets + detail, DataAnalytics, ParentDashboard, BulkUploadSummary, **RootLayout topbar search**.
- **Remaining (service exists):** AuthContext (`DEMO_USERS` → `authService`) — **do last; session-critical, pairs with real backend.** This is the only non-deferred consumer left.
- **No service yet (deferred):** PaymentSettings (`data/financialSecurity`), ServiceAdvisories (`data/serviceAdvisories`), bulk helpers (`data/bulkTemplate`, `data/dropoffLocations`, `data/paymentAccounts`).
- **Intentional `data/*` stays (not data access):** `useNotificationViewer`/`CATEGORY_META` (notifications hook/config); `SUBACCOUNT_OPTIONS` presentation options in Claims/Reports/SlaAlerts; SubAccountContext infra imports.

## Key decisions
- **RootLayout search:** fetched full lists via services into state + refresh on navigation (mirrors the bell), rather than using each service's `search` filter — this keeps the exact prior local filter semantics (e.g. tx matches tracking+recipient only, not destination). Filtering remains presentation-only.
- **BulkUploadSummary:** reused existing `getBulkUploadById()` (no new service method). Default state value kept identical to the old fallback string, preserving the unknown-batch case.

## Validation
- `npm run build` (tsc -b + vite build) passes — 0 TS errors. Main bundle ~639 kB; DataAnalytics chunk ~432 kB (pre-existing >500 kB warning only).

## Repo notes
- `.claude/CLAUDE.md` is untracked (session-management protocol) — leave as-is unless asked.
- Agentic commit mode: validate then commit each scoped task (small logical commits); no push unless asked.

## Next recommended task
**AuthContext → authService** (the final migration). Replace inline `DEMO_USERS` login/session logic with `authService.loginMockUser()` / `getCurrentUser()`. **Caution:** session-critical — it gates all route guards and role/scope derivation; `authService` is currently unconsumed, so verify its surface matches `AuthContext`'s needs (login by email/password, current user with role + accountId/accountName, logout) before wiring. Best done deliberately, ideally alongside or just before real backend auth. After this, Roadmap step 3 (UI→service migration) is effectively complete except the intentionally-deferred no-service modules.
