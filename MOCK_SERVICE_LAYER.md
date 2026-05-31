# GGX Corporate — Mock Service Layer

**Created:** 2026-05-31
**Purpose:** API-ready architecture without a real backend. All services simulate future API calls using local mock data; swap the implementation body for real `fetch()` calls when backend endpoints are confirmed.

---

## 1. Why this layer exists

The app was previously wiring pages directly to data modules in `src/app/data/`. This created:
- Multiple sources of truth for accounts and subaccounts
- Name-based matching where ID-based matching was needed
- No clear seam for future API integration

The service layer adds one abstraction level: **pages → services → mock data → (future) real API**. This means:
- Future API integration requires only changing the service body — no UI changes
- All business rules are in one place (services), not scattered across pages
- TypeScript interfaces document the expected API contract

---

## 1b. Architecture intent — facades, not direct source-system clients

GGX Corporate will **not** own all source data directly, and the frontend should
**not** orchestrate many backend systems. The service layer is a **frontend-facing
facade** shaped around UI domain needs. Service names (`transactionService`,
`accountService`, `userService`, `notificationService`, `settlementService`,
`paymentService`) represent **frontend domain needs**, not one backend system each.

**Recommended future integration pattern:**

```
GGX Corporate UI → frontend service layer → GGX Corporate API / BFF / API gateway → source systems
```

The BFF/API gateway aggregates and shapes data; the frontend never calls source
systems (OMS, FTX, Cashinator, AMS, NS, Firebase, Contract Manager, FarEye-linked
systems) directly, and no backend URLs are hardcoded in the frontend.

**Future source-system ownership (indicative, behind the BFF):**

| Domain | Source system |
|---|---|
| Order / transaction records, official transaction status | OMS |
| Rider/courier assignment, fulfillment status updates | Fulfillment / FarEye-linked systems |
| Finance: fees, earnings, settlements, ledgers, official finance values | FTX |
| Payment processing + payment status | Cashinator |
| Accounts, subaccounts, contracts, billing eligibility | Contract Manager |
| Location data | AMS |
| Notification events | NS |
| Users / auth / identity | Firebase or identity provider |
| Related tickets and claims | Support / Claims systems |

A single frontend service (e.g. `transactionService`) may later aggregate shaped
data from **multiple** systems (OMS + fulfillment + FTX + claims). It does **not**
map 1:1 to OMS.

### No-frontend-business-computation rule

The GGX Corporate frontend **must not** be the source of truth for business math
or operational decisions.

**Allowed (presentation-only):** filtering, sorting, grouping, formatting, UI
counts, permission-based show/hide using flags already returned by services, form
completeness checks, and frontend-only validation hints.

**Not allowed (must come from source systems / BFF):** shipping/COD/protection
fees, fuel surcharge, earnings, settlements, ledger totals, payout amounts,
payment status, SLA hit/miss, delivery efficiency, RTS rate, claim approval
amounts, fulfillment status, official transaction status, billing balances,
penalty amounts, remittance amounts.

**Mock-service values are sample backend-provided/precomputed fields.** Where the
mock currently derives a value (e.g. batch counts, fee totals), it is treated as
if the backend supplied it — a stand-in for a real BFF response, not a frontend
source-of-truth calculation. These are clearly annotated in the service code.

---

## 1c. Cross-system orchestration — owned by the BFF, never the frontend

The source systems behind GGX Corporate are **not isolated**. They are
interconnected and **event-driven**: an update in one system may trigger
updates, notifications, alerts, derived statuses, or downstream records in
others. Illustrative chains:

- **OMS** transaction updates may trigger **NS** notifications.
- **Fulfillment / FarEye-linked** status changes may update transaction status
  (OMS), SLA alerts, and customer notifications (NS).
- **Cashinator** payment updates may affect payment status, COD status, and
  finance visibility (FTX).
- **FTX** settlement/ledger updates may affect earnings, reports, and finance
  dashboards.
- **Contract Manager** account/billing changes may affect permissions, available
  payment options, and account/subaccount access.
- **Support / Claims** activity may create notifications (NS) and
  transaction-linked status indicators (OMS).

**Rules (the frontend must honor all of these):**

1. **No direct cross-system orchestration.** The GGX Corporate frontend must not
   coordinate multi-system workflows (e.g. "mark delivered → recompute SLA →
   push a notification → update earnings"). It triggers a single intent against
   its facade and renders what comes back.
2. **No frontend-inferred official state from combining systems.** The frontend
   must not derive an authoritative value/status by stitching together data from
   multiple systems on its own (e.g. inferring settlement status from payments +
   fulfillment, or SLA hit/miss from timestamps + fulfillment events). Official
   reconciled state is delivered by the backend.
3. **The service layer is only a UI-facing facade.** A service (e.g.
   `transactionService`) shapes data for one UI domain. It is **not** an
   orchestrator, an event bus, or a place where cross-system reconciliation
   logic lives.
4. **The BFF/API gateway owns aggregation, orchestration, event interpretation,
   and source-system reconciliation.** Event fan-out, derived-status
   computation, and consistency across OMS / fulfillment / FTX / Cashinator /
   Contract Manager / NS / AMS / identity all happen server-side, behind the
   facade.
5. **Mock services may simulate final shaped outcomes, but must not imply the
   frontend owns orchestration.** When a mock action appears to cause a
   side effect (e.g. filing a claim today also pushes a notification), treat it
   as a **stand-in for a backend-emitted event**, not as frontend orchestration.
   In production the BFF/source systems emit those downstream effects; the mock
   only fakes the end result for the demo. Such places are annotated in code.

```
            ┌─────────────────────────── GGX Corporate BFF / API gateway ───────────────────────────┐
 UI → service facade →  │ aggregation · orchestration · event interpretation · reconciliation │  → OMS · Fulfillment/FarEye
            └───────────────────────────────────────────────────────────────────────────────────────┘     · FTX · Cashinator
                                                                                                            · Contract Manager
            (frontend renders shaped results; it never fans out events or reconciles systems)              · NS · AMS · identity
```

> **Current mock caveat:** some `data/*` modules today both mutate local state
> *and* push a notification synchronously (claims, SLA, bulk uploads, financial
> security, support tickets). This is a **demo stand-in for a backend-emitted
> event**, not an endorsement of frontend orchestration. When these domains move
> behind the BFF, the downstream notification/derived-status effects become
> server-side events; the frontend keeps only the single triggering intent.

---

## 2. Service files created

| File | Purpose | Future API equivalent |
|---|---|---|
| `src/app/services/authService.ts` | Login/logout, session, permissions | `POST /auth/login`, `GET /auth/me` |
| `src/app/services/accountService.ts` | Main account + subaccount data, switcher | `GET /accounts/me`, `GET /accounts/me/subs` |
| `src/app/services/userService.ts` | Users, manager assignments, capacity | `GET /users`, `PUT /users/:id` |
| `src/app/services/transactionService.ts` | Transaction list/detail, filters, settlement | `GET /transactions`, `GET /transactions/:id` |
| `src/app/services/notificationService.ts` | Notifications, unread count, mark read | `GET /notifications`, `PATCH /notifications/read-all` |
| `src/app/services/bulkUploadService.ts` | Upload history, batch summary, scoping | `GET /bulk-uploads`, `GET /bulk-uploads/:id` |
| `src/app/services/claimsService.ts` | Claims list/detail, file claim, cancel booking, eligibility | `GET /claims`, `POST /claims`, `POST /transactions/:id/cancel` |
| `src/app/services/slaService.ts` | SLA alerts list, follow-up, resolve | `GET /sla-alerts`, `POST /sla-alerts/:id/follow-up`, `POST /sla-alerts/:id/resolve` |
| `src/app/services/reportsService.ts` | Report list, filters, download | `GET /reports`, `POST /reports/generate`, `GET /reports/:id/download` |
| `src/app/services/earningsService.ts` | Settlements list + detail (FTX-owned figures) | `GET /accounts/me/settlements`, `GET /settlements/:id` |

---

## 3. Mock data files created

| File | Contents | Canonical for |
|---|---|---|
| `src/app/data/mock/accounts.mock.ts` | `MOCK_MAIN_ACCOUNT`, `MOCK_SUBACCOUNTS`, lookup maps | All account/subaccount objects |
| `src/app/data/mock/auth.mock.ts` | `MOCK_AUTH_USERS`, `MOCK_CREDENTIALS`, `MockPermissions` | Demo users + permissions |
| `src/app/data/mock/users.mock.ts` | Re-exports `data/users.ts` | User seed + helpers |
| `src/app/data/mock/transactions.mock.ts` | Re-exports `data/transactions.ts` | Transaction seed + helpers |
| `src/app/data/mock/notifications.mock.ts` | Re-exports `data/notifications.ts` | Notification model + helpers |
| `src/app/data/mock/bulkUploads.mock.ts` | Re-exports `data/bulkUploads.ts` | Upload records + helpers |

---

## 4. Canonical account/subaccount IDs

| Account | ID | Notes |
|---|---|---|
| Main Account (parent) | `main` | **NOT `main-account`** — changing would break auth, storage, notifications, SubAccountContext. Kept as `main` throughout. |
| Acme Corporation | `acme-corporation` | Default subaccount |
| Acme Luzon | `acme-luzon` | Additional subaccount |
| Acme Visayas | `acme-visayas` | Additional subaccount |

The single canonical source is now `src/app/data/mock/accounts.mock.ts`.

---

## 5. UI modules now consuming services

| UI module | Service used | Migrated |
|---|---|---|
| `pages/Transactions.tsx` | `transactionService.getTransactions()`, `getTransactionBatches()`, `statusConfig` | ✅ 2026-05-31 |
| `pages/TransactionDetails.tsx` | `transactionService.getTransactionById()`, `getTransactionTotals()`, `statusConfig` | ✅ 2026-05-31 |
| `pages/Dashboard.tsx` (recent transactions panel) | `transactionService.getRecentTransactions()`, `statusConfig` | ✅ 2026-05-31 |
| `pages/SubAccountSettings.tsx` | `userService.getUsers_()`, `setSubaccountManagers()`, `MAX_MANAGERS_PER_SUBACCOUNT` | ✅ 2026-05-31 |
| `pages/SubAccounts.tsx` (manager lookups) | `userService.getManagersBySubaccountId()` | ✅ 2026-05-31 |
| `pages/SubAccounts.tsx` (subaccount list) | `accountService.getSubaccounts()` (runtime-aware) | ✅ 2026-05-31 |
| `pages/UsersPermissions.tsx` | `userService` full surface: `getUsers_()`, `createUser()`, `updateUser()`, `updateUserSubaccountAssignments()`, `removeUser()`, `getSubaccountOptions()` | ✅ 2026-05-31 |
| `pages/BulkUploader.tsx` | `bulkUploadService.getBulkUploads()` + re-exported write helpers (`addUpload`, `updateUploadStatus`, `generateUploadId`, `createUploadRecord`) | ✅ 2026-05-31 |
| `pages/Notifications.tsx` | `notificationService.getNotifications()`, `markVisibleRead()`, `formatNotificationTime()` | ✅ 2026-05-31 |
| `layouts/RootLayout.tsx` (bell) | `notificationService.getNotifications()`, `getUnreadCount()`, `markVisibleRead()`, `formatNotificationTime()` | ✅ 2026-05-31 |

> **Note on notifications:** `useNotificationViewer()` (a React hook) and `CATEGORY_META` (presentation config) intentionally stay in `data/notifications` — they are not data access. The bell's unread badge is now state refreshed on viewer + route change (matches the prior per-render freshness) and reset to 0 after marking read on open.

> **Note on `SubAccounts.tsx`:** both manager lookups (`userService`) and the subaccount **list** (`accountService`) are now migrated. The list is runtime-aware via a shared store (see "Runtime subaccount store" below). The context is still used for enabled state, account switching, and as the reload trigger.

### Runtime subaccount store (`data/runtimeAccounts.ts`)

`accountService.getSubaccounts()` must return the **live** subaccount list (including Request-flow adds), but `accountService` is a non-React module and cannot read `SubAccountContext`'s React state. Bridge:

- `data/runtimeAccounts.ts` holds the current subaccount list in a module variable (synchronous source of truth).
- `SubAccountContext` mirrors its list into the store **synchronously** on init and on every mutation (`enableSubAccounts`, `addSubAccount`) — not in an effect, so a reader's effect that runs after a state change always sees the current list (avoids child-before-parent effect-ordering staleness).
- `accountService.getSubaccounts()` reads the store.
- The context keeps its public API unchanged; no other consumer was touched.
- Future: the BFF (over Contract Manager) owns this; the context would hydrate the store from an API response.

All other pages still import from `src/app/data/` directly (see §6).

### Transactions migration notes (2026-05-31)
- Both pages now load via the async service facade with safe loading/error handling. No visible behavior changed (list, filters, search, All / By Batch views, detail, upload source, batch→detail links all preserved).
- **Presentation-only logic stays in the UI:** filtering, search, and the "Showing X of Y" count run locally over the service-provided list. These are allowed UI operations.
- **Batch roll-ups are service-provided sample fields:** `getTransactionBatches()` returns each batch with precomputed `counts` (total/delivered/inProgress/failed), a roll-up `status` label, and `uploadedDate`. The UI renders these as-is — it does not compute them. In production these come from the BFF (OMS membership + fulfillment status), not the frontend.
- **Detail totals are service-provided sample fields:** `getTransactionTotals()` returns `itemsTotal` and `feesTotal`. These are documented as backend/FTX-owned official values; the mock derives them only because the static seed has no precomputed totals.

---

## 6. UI modules still using data files directly

All UI pages currently import from `src/app/data/` directly. This is safe and unchanged. Future migration is one file at a time:

| Module | Current import | Future service |
|---|---|---|
| ~~Transactions page~~ | ~~`data/transactions`~~ | ✅ **Migrated** → `transactionService.getTransactions()` / `getTransactionBatches()` |
| ~~Transaction Details~~ | ~~`data/transactions`~~ | ✅ **Migrated** → `transactionService.getTransactionById()` / `getTransactionTotals()` |
| Claims page | `data/claims` | (claims service — deferred) |
| SLA Alerts page | `data/slaAlerts` | (sla service — deferred) |
| ~~Users & Permissions~~ | ~~`data/users`~~ | ✅ **Migrated** → full `userService` (create/update/assign/remove) |
| ~~SubAccountSettings~~ | ~~`data/users`~~ | ✅ **Migrated** → `userService.getUsers_()` + `setSubaccountManagers()` |
| ~~SubAccounts page~~ | ~~`contexts/SubAccountContext` (list)~~ | ✅ **Migrated** → `accountService.getSubaccounts()` (runtime-aware) + `userService` for managers |
| ~~Notifications page~~ | ~~`data/notifications`~~ | ✅ **Migrated** → `notificationService` (hook + CATEGORY_META stay in data) |
| ~~Bell popover~~ | ~~`data/notifications`~~ | ✅ **Migrated** → `notificationService` (unread count now effect-refreshed) |
| ~~Claims page~~ | ~~`data/claims`~~ | ✅ **Migrated** → `claimsService.getClaimsList()` |
| ~~Transaction Details (claims)~~ | ~~`data/claims`~~ | ✅ **Migrated** → `claimsService` (file/cancel/eligibility); support tickets still on `data/supportTickets` |
| ~~SLA Alerts page~~ | ~~`data/slaAlerts`~~ | ✅ **Migrated** → `slaService.getSlaAlertsList()` / `sendAlertFollowUp()` / `resolveSlaAlert()` |
| ~~Dashboard (SLA card)~~ | ~~`data/slaAlerts`~~ | ✅ **Migrated** → `slaService.getSlaAlertsList({ openOnly })` |
| ~~Reports page~~ | ~~`data/reports`~~ | ✅ **Migrated** → `reportsService.getReports()` + `downloadReport` |
| ~~Earnings page~~ | ~~`data/earnings`~~ | ✅ **Migrated** → `earningsService.getSettlements()` |
| ~~Earnings Settlement Detail~~ | ~~`data/earnings`~~ | ✅ **Migrated** → `earningsService.getSettlementById()` |
| ~~BulkUploader~~ | ~~`data/bulkUploads`~~ | ✅ **Migrated** → `bulkUploadService.getBulkUploads()` + re-exported write helpers |
| Dashboard | ~~`data/transactions`~~ (recent tx ✅ migrated → `transactionService.getRecentTransactions()`); `data/slaAlerts` still direct | `transactionService` done; SLA service deferred |
| RootLayout search | `data/transactions`, `data/claims`, `data/supportTickets` | `transactionService.getTransactions()` with search filter |
| AuthContext | `contexts/AuthContext` | `authService.loginMockUser()`, `authService.getCurrentUser()` |

---

## 7. Deferred service migrations

The following data modules have no service wrapper yet. They can be added when those pages are ready for migration:

| Module | Data file | Reason deferred |
|---|---|---|
| ~~Claims~~ | ~~`data/claims.ts`~~ | ✅ **Done** → `claimsService` (Claims page + TransactionDetails claims) |
| ~~SLA Alerts~~ | ~~`data/slaAlerts.ts`~~ | ✅ **Done** → `slaService` (SLA Alerts page + Dashboard SLA card) |
| ~~Reports~~ | ~~`data/reports.ts`~~ | ✅ **Done** → `reportsService` (Reports page) |
| ~~Earnings/Settlements~~ | ~~`data/earnings.ts`~~ | ✅ **Done** → `earningsService` (Earnings list + Settlement detail). Note: `transactionService.getTransactionsBySettlementId` still reads `data/earnings` directly (service→data, acceptable). |
| Support Tickets | `data/supportTickets.ts` | Zendesk boundary already isolated |
| Service Advisories | `data/serviceAdvisories.ts` | Read-only, low priority |
| Payment Accounts | `data/paymentAccounts.ts` | OTP-gated, finance Admin-only |
| Financial Security | `data/financialSecurity.ts` | Admin-only, tied to OTP flow |

---

## 8. Backend API contracts still needed

Before real API integration can begin, the following contracts must be confirmed with the backend team:

### Auth
- `POST /auth/login` — body: `{ email, password }`, response: `{ user, token, expiresAt }`
- `POST /auth/logout` — clears server session
- `GET /auth/me` — response: full user object with role + scoped account id

### Accounts
- `GET /accounts/me` — parent account details
- `GET /accounts/me/subaccounts` — list of subaccounts the authenticated user can see
- `GET /accounts/subaccounts/:id` — single subaccount

### Users
- `GET /accounts/:id/users` — user list for a parent account
- `POST /accounts/:id/users` — create user (Manager assignment)
- `PUT /users/:id` — update user
- `PUT /users/:id/subaccounts` — update subaccount assignments
- `DELETE /users/:id` — remove user

### Transactions
- `GET /transactions` — paginated list with filters (status, type, subaccountId, search)
- `GET /transactions/:trackingNumber` — full transaction detail
- `GET /subaccounts/:id/transactions` — scoped list

### Notifications
- `GET /notifications` — list with viewer-scope param
- `PATCH /notifications/read` — mark all read
- `PATCH /notifications/:id/read` — mark single read

### Bulk Uploads
- `GET /bulk-uploads` — list with filters
- `GET /bulk-uploads/:id` — batch detail
- `POST /bulk-uploads` — initiate batch (replaces frontend mock)

### Reports / Finance
- `GET /reports` — report list (scoped)
- `POST /reports/generate` — trigger report generation
- `GET /accounts/me/earnings` — earnings/settlement summary
- `GET /settlements/:id` — settlement detail with transaction breakdown

---

## 9. Scope rules (enforced in service layer)

| Rule | Enforced by |
|---|---|
| Finance is Admin-only | `authService.hasPermission('canAccessFinance')` |
| Manager sees own subaccount only | `accountService.getSubaccounts(activeAccountId)` |
| Max 2 Managers per subaccount | `userService.createUser`, `userService.updateUserSubaccountAssignments` |
| Reports scoped to subaccount for Managers | `transactionService.getTransactions({ subaccountId })` |
| Subaccount assignment is Admin-only | Documented in `userService`; enforced by route guard in UI |

---

## 10. Migration sequence (recommended)

1. ✅ **Service layer created**
2. ✅ **Transactions pages migrated** → `transactionService` (Transactions.tsx + TransactionDetails.tsx, 2026-05-31). Validated the seam: async facade, presentation-only filtering, service-provided sample roll-ups/totals.
3. ✅ **SubAccountSettings.tsx migrated** → `userService` (read via `getUsers_()`, write via new `setSubaccountManagers()`, 2026-05-31). Exercised the `userService` seam incl. an async write path.
4. ✅ **SubAccounts.tsx fully migrated** → manager lookups via `userService`, list via `accountService.getSubaccounts()` (2026-05-31). The blocker (accountService couldn't see runtime adds) was resolved with the runtime subaccount store (`data/runtimeAccounts.ts`) mirrored synchronously by the context. Context retains the React-facing ownership (state, persistence, currentAccount, helpers).
5. ✅ **Users & Permissions migrated** → full `userService` (create/update/assign/remove + subaccount options, 2026-05-31). `userService` is now fully consumed; business rules (duplicate email, manager cap, sole-Admin protection) are enforced in the service.
6. ✅ **BulkUploader migrated** → `bulkUploadService` (recent-uploads read + write helpers, 2026-05-31).
7. ✅ **Notifications bell + Notifications page migrated** → `notificationService` (2026-05-31). Unread badge is now effect-refreshed on viewer + route change; `useNotificationViewer`/`CATEGORY_META` stay in `data/notifications`. Other modules still call `data/notifications` push helpers directly (claims/SLA/bulk/financial); routing those writes through `notificationService.pushNotification()` is a future cleanup.
8. ✅ **accountService made runtime-aware** via the shared store (2026-05-31), unblocking and completing the `SubAccounts.tsx` list migration (step 4). Note: the context still owns React state + persistence; full ownership transfer to `accountService` (so the context becomes a thin store wrapper) remains a larger optional cleanup.
9. **Last:** Auth migration — requires real backend endpoint.
