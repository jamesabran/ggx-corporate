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

## 2. Service files created

| File | Purpose | Future API equivalent |
|---|---|---|
| `src/app/services/authService.ts` | Login/logout, session, permissions | `POST /auth/login`, `GET /auth/me` |
| `src/app/services/accountService.ts` | Main account + subaccount data, switcher | `GET /accounts/me`, `GET /accounts/me/subs` |
| `src/app/services/userService.ts` | Users, manager assignments, capacity | `GET /users`, `PUT /users/:id` |
| `src/app/services/transactionService.ts` | Transaction list/detail, filters, settlement | `GET /transactions`, `GET /transactions/:id` |
| `src/app/services/notificationService.ts` | Notifications, unread count, mark read | `GET /notifications`, `PATCH /notifications/read-all` |
| `src/app/services/bulkUploadService.ts` | Upload history, batch summary, scoping | `GET /bulk-uploads`, `GET /bulk-uploads/:id` |

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
| Users & Permissions | `data/users` | `userService.getUsers_()`, `userService.updateUser()` |
| ~~SubAccountSettings~~ | ~~`data/users`~~ | ✅ **Migrated** → `userService.getUsers_()` + `setSubaccountManagers()` |
| SubAccounts page | `contexts/SubAccountContext` | `accountService.getSubaccounts()` |
| Notifications page | `data/notifications` | `notificationService.getNotifications()` |
| Bell popover | `data/notifications` | `notificationService.getUnreadCount()` |
| BulkUploader | `data/bulkUploads` | `bulkUploadService.getBulkUploads()` |
| Dashboard | ~~`data/transactions`~~ (recent tx ✅ migrated → `transactionService.getRecentTransactions()`); `data/slaAlerts` still direct | `transactionService` done; SLA service deferred |
| RootLayout search | `data/transactions`, `data/claims`, `data/supportTickets` | `transactionService.getTransactions()` with search filter |
| AuthContext | `contexts/AuthContext` | `authService.loginMockUser()`, `authService.getCurrentUser()` |

---

## 7. Deferred service migrations

The following data modules have no service wrapper yet. They can be added when those pages are ready for migration:

| Module | Data file | Reason deferred |
|---|---|---|
| Claims | `data/claims.ts` | Depends on transaction service being wired first |
| SLA Alerts | `data/slaAlerts.ts` | Similar to claims; both feed analytics |
| Reports | `data/reports.ts` | Report generation UI doesn't need async yet |
| Earnings/Settlements | `data/earnings.ts` | Finance is Admin-only; low migration urgency |
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
4. **Next:** Migrate `SubAccounts.tsx` → `accountService.getSubaccounts()` (replaces SubAccountContext dependency)
5. **Then:** Migrate `Users & Permissions` → full `userService` (add/edit/remove)
6. **Then:** Migrate notifications bell → `notificationService`
7. **Last:** Auth migration — requires real backend endpoint
