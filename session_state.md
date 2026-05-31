# GGX Corporate — Session State

**Last updated:** 2026-05-31
**Current phase:** Service-layer UI migration (Roadmap step 3) — **all non-deferred consumers migrated.** Remaining work is the no-service-yet modules (deferred) and the real backend stage.

## Completed (recent tasks)
- **SUBACCOUNT_OPTIONS → userService.getSubaccountOptions()** (frontend-only). Claims, Reports, and SlaAlerts now load subaccount filter options into state from the existing `userService.getSubaccountOptions()` instead of importing the raw `SUBACCOUNT_OPTIONS` constant from `data/users`. Dropdowns render from state. `data/users` now has no page importers. Build green.
- **paymentService** (frontend-only). Wrapped `data/paymentAccounts` (`isBillingAccount`/`getContractType`) behind an async `paymentService`; BulkUploader + BulkUploadSummary now load `billingAvailable` into state (keyed on active account, default `true` until resolved). `data/paymentAccounts` has no page importers. Build green.
- **ServiceAdvisories → serviceAdvisoriesService** + **PaymentSettings → financialSecurityService** (frontend-only). Created both services (async facades over their data modules, re-exporting presentation meta/types, documented source-system + BFF-event ownership). ServiceAdvisories loads the list into state (status filter + active count stay local); PaymentSettings records OTP-verified changes via the service (fire-and-forget, backend-event semantics). Build green. `data/serviceAdvisories` + `data/financialSecurity` now have no page importers.
- **AuthContext + Login → authService** (frontend-only, Option A). `Login.tsx` now validates via `authService.loginMockUser(email, password)` and maps the result to the context's `AuthUser` (context type + all `useAuth()` consumers untouched). `authService` owns session persistence (login) and clearing (`logoutMockUser`); the context keeps a **synchronous** localStorage init read to avoid auth-hydration flicker (deliberate shortcut — revisit with real async backend auth). `MOCK_CREDENTIALS`/`MOCK_AUTH_USERS` verified to mirror the old demo logins. `DEMO_USERS` is now **dead code** (kept for now; safe to remove later). **Manual login QA recommended** — only build-validated, no runtime smoke test was run.
- **RootLayout topbar search → services** (commit pending this session). Cross-domain shell search now sources its three lists from `transactionService.getTransactions()`, `claimsService.getClaimsList()`, `ticketsService.getTicketsList()`, loaded into state and refreshed on `location.pathname` change. Local filtering (tracking + recipient for tx; id + trackingNumber for claims/tickets) unchanged. `data/transactions`, `data/claims`, `data/supportTickets` now have **no direct page/layout importers** — only their services read them.
- **BulkUploadSummary → bulkUploadService** (commit `5e8aa61`). Replaced `getSessionUploads()` with `bulkUploadService.getBulkUploadById(id)`; batch date loads into state, fallback `'2026-05-19 10:30 AM'` preserved. `data/bulkUploads` now has no direct page importers.

## Migration status (overall)
- **Migrated:** Transactions, TransactionDetails, Dashboard (recent-tx + SLA card), SubAccounts (list + managers), SubAccountSettings, UsersPermissions, BulkUploader, Notifications page + RootLayout bell, Claims, SLA Alerts, Reports, Earnings + Settlement Detail, Support Tickets + detail, DataAnalytics, ParentDashboard, BulkUploadSummary, RootLayout topbar search, **AuthContext + Login**.
- **Remaining (service exists):** none — all non-deferred UI consumers now go through the service layer.
- **No service yet (remaining):** bulk helpers — `data/bulkTemplate` (CSV columns/template generator), `data/dropoffLocations` (static drop-off list), `data/paymentAccounts` (`isBillingAccount()` sync billing-eligibility helper used in render by BulkUploader/BulkUploadSummary/PaymentMethodTabs). These are static-config/helper reads, not domain data fetches; `paymentAccounts` would need an async `paymentService` + multi-consumer state refactor.
- **Intentional `data/*` stays (not data access):** `useNotificationViewer`/`CATEGORY_META` (notifications hook/config); `SUBACCOUNT_OPTIONS` presentation options in Claims/Reports/SlaAlerts; SubAccountContext infra imports.

## Key decisions
- **AuthContext (Option A):** kept context's `AuthUser` type + sync localStorage init (no flicker); routed validation/persistence through `authService`. `getCurrentUser()` intentionally NOT used for init yet (would reintroduce async hydration) — that's the backend-stage task.
- **RootLayout search:** fetched full lists via services into state + refresh on navigation (mirrors the bell), rather than using each service's `search` filter — keeps the exact prior local filter semantics. Filtering remains presentation-only.
- **BulkUploadSummary:** reused existing `getBulkUploadById()` (no new service method). Default state value kept identical to the old fallback string.

## Validation
- `npm run build` (tsc -b + vite build) passes — 0 TS errors. Main bundle ~641 kB; DataAnalytics chunk ~432 kB (pre-existing >500 kB warning only).
- ⚠️ AuthContext change is build-validated only — **manual login/logout/refresh QA recommended** before relying on it.

## Repo notes
- `.claude/CLAUDE.md` is untracked (session-management protocol) — leave as-is unless asked.
- Agentic commit mode: validate then commit each scoped task (small logical commits); no push unless asked.
- **Dead code:** `DEMO_USERS` in `AuthContext.tsx` is now unused by code (Login uses `authService`). Safe-to-remove follow-up; left to keep the diff minimal and preserve the auth.mock canonical-source note.

## Remaining direct `data/*` reads (full inventory, after this session)
- `pages/BulkUploader.tsx`, `pages/BulkUploadSummary.tsx` → `data/bulkTemplate` (`downloadBulkTemplate`, `BULK_TEMPLATE_COLUMNS`, `RECEPTACLE_SIZES`) and `data/dropoffLocations` (`DROPOFF_LOCATIONS`).
- `pages/Notifications.tsx`, `layouts/RootLayout.tsx` → `data/notifications` (`useNotificationViewer` hook + `CATEGORY_META` presentation config) — **intentional, not data access.**
- `contexts/SubAccountContext.tsx` → `data/accounts` (`getAccountIdByName`), `data/runtimeAccounts` (`setRuntimeSubaccounts`), `data/mock/accounts.mock` (`MockSubaccount` type) — **infrastructure, intentional.**

## Weighing of all next tasks (decision basis for agentic continuation)
1. **dropoffLocations → service** — *Logically correct next task.* Locations are **AMS-owned** in the documented source-system map (MOCK_SERVICE_LAYER.md §1b), so a static drop-off list reaching into `data/` is a genuine (if small) facade gap. Pattern is identical to `serviceAdvisoriesService` (read-only list → state). Low risk. Consumers: BulkUploader (dialog) + BulkUploadSummary (dialog). **Do this next.**
2. **bulkTemplate → leave as-is.** `downloadBulkTemplate()` is a pure client-side CSV generation action and `BULK_TEMPLATE_COLUMNS`/`RECEPTACLE_SIZES` are frontend form constants — **not backend-owned domain data.** Wrapping them in a service would be incorrect modeling. Leave as frontend config. (If `RECEPTACLE_SIZES` later becomes backend reference data, revisit.)
3. **notifications hook / CATEGORY_META, SubAccountContext infra → leave as-is.** Intentional (presentation hook/config + context infrastructure).
4. **Backend / API integration** — next *major stage*, **out of current scope** per standing instructions. Swap each service's mock body for real `fetch()` against the BFF, starting with auth (incl. the async session-hydration + loading state the AuthContext sync-init shortcut defers). Requires confirmed API contracts (MOCK_SERVICE_LAYER.md §8).

## Next recommended task
**Migrate `dropoffLocations` to a `dropoffService` (or `locationService`)** — async `getDropoffLocations()` facade, re-export the `DropoffLocation` type; load into state in BulkUploader + BulkUploadSummary (the drop-off dialog list). After that, the frontend→service migration is genuinely complete (only frontend config + intentional presentation/infra reads remain), and the next effort is the backend stage.
