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

None at this stage. The service layer was built in parallel with the existing UI. No pages were migrated in this pass to avoid breaking working functionality.

This is intentional — the service layer documents the future API contract and centralizes business logic without risking regressions.

---

## 6. UI modules still using data files directly

All UI pages currently import from `src/app/data/` directly. This is safe and unchanged. Future migration is one file at a time:

| Module | Current import | Future service |
|---|---|---|
| Transactions page | `data/transactions` | `transactionService.getTransactions()` |
| Transaction Details | `data/transactions` | `transactionService.getTransactionById()` |
| Claims page | `data/claims` | (claims service — deferred) |
| SLA Alerts page | `data/slaAlerts` | (sla service — deferred) |
| Users & Permissions | `data/users` | `userService.getUsers_()`, `userService.updateUser()` |
| SubAccountSettings | `data/users` | `userService.getManagersBySubaccountId()` |
| SubAccounts page | `contexts/SubAccountContext` | `accountService.getSubaccounts()` |
| Notifications page | `data/notifications` | `notificationService.getNotifications()` |
| Bell popover | `data/notifications` | `notificationService.getUnreadCount()` |
| BulkUploader | `data/bulkUploads` | `bulkUploadService.getBulkUploads()` |
| Dashboard | `data/transactions`, `data/slaAlerts` | `transactionService.getRecentTransactions()` |
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

1. ✅ **Service layer created** (this PR)
2. **Next:** Migrate `SubAccountSettings.tsx` → `userService.getManagersBySubaccountId()` (lowest risk)
3. **Next:** Migrate `SubAccounts.tsx` → `accountService.getSubaccounts()` (replaces SubAccountContext dependency)
4. **Then:** Migrate `Users & Permissions` → full `userService` (add/edit/remove)
5. **Then:** Migrate notifications bell → `notificationService`
6. **Later:** Migrate transaction pages once search + filter tests pass
7. **Last:** Auth migration — requires real backend endpoint
