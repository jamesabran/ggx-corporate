# GGX Corporate — Project Handoff

Compact checkpoint for continuing in a fresh Claude session. For detail, see `IMPLEMENTATION_LOG.md`, `GGX_CORPORATE_APP_STRUCTURE.md`, `DS_USAGE_GUIDE.md`, `GGX_CORPORATE_DS_CONTEXT.md`.

## 1. Current state (checkpoint 2026-05-31)
Working React SPA, demo/mock-only (no backend). `npm run build` passes — 0 TS errors. recharts is code-split into its own ~432 kB lazy chunk; main bundle ~622 kB (above Vite's 500 kB warning; +8 kB from topbar search). All routes render and are **auth-guarded**.

**Foundations complete:** mock authentication, route guards (ProtectedRoute + AdminRoute), localStorage persistence, account-scoped notifications, Admin/Manager role behavior, and a mock service layer (infrastructure only — no UI consumers yet). All five Business Development roadmap items shipped (see §13). UX fix pass complete (see §13). Next production-track step: **migrate UI consumers to use the service layer**, then **backend/API integration**.

**Mock logins** (password `!1234qwer`): `max@email.com` (Admin / parent) · `manager@email.com` (Manager / Acme Luzon). Demo quick-login buttons on the Login page.

## 2. Tech stack
React 18 + TypeScript + Vite 6 + Tailwind v4 + react-router 7. Icons: `@tabler/icons-react`. No spreadsheet/icon/UI libs beyond these — **do not add dependencies** without explicit approval.

## 3. Key app structure
- `src/app/pages/*` — one file per route; `src/app/layouts/RootLayout.tsx` (sidebar/topbar shell).
- `src/app/components/ui/*` — DS primitives: Button, Badge, Card, Input, Select, Table, Tabs, **Dialog/ConfirmDialog**.
- `src/app/components/*` — app components (AddressBook, AddressDisplayCard, PaymentMethodTabs).
- `src/app/data/*` — mock data/helpers (transactions, bulkTemplate, dropoffLocations, paymentAccounts).
- `src/app/contexts/SubAccountContext.tsx` — account/subaccount state + `getCurrentAccountName()`.

## 4. DS rules to preserve
Primary `#0088C9` via CSS vars; use semantic tokens, not hardcoded hex. Button variants: `default`(primary)/`secondary`/`outline`/`ghost`/`link`/`destructive`; sizes `default`/`sm`/`lg`/`icon`. Badge incl. status variants success/info/warning/danger/pending. Tabler icons only. Disabled = `opacity-50 pointer-events-none`; focus = `focus-visible:ring-2`. Modals via `Dialog`/`ConfirmDialog` (never new inline `fixed inset-0` modals). Do not change global DS tokens.

## 5. Major completed features (recent commits)
Foundations: mock auth + route guards + localStorage persistence; stable subaccount IDs; account-scoped notifications. BD roadmap: Financial/OTP, Claims & Cancellations, SLA Alerts, Data Analytics redesign (+recharts code-split). Earlier: Bulk Upload flow (header check → mapping → processing → review → booking), PaymentMethodTabs, reusable Dialog/ConfirmDialog, Notifications (tabbed + bell), Reports, Service Advisories, Support Tickets (+detail), Users & Permissions, Address Book pickup-location API.

## 6. Product decisions
- Access model: **Admin** (one, all accounts) + **Manager** (one per subaccount). No Owner/Finance/Viewer/Operator, no Level.
- Icons: Tabler is the single set.
- Naming: Button `destructive` (not `danger`); size `default` (not `md`). Complaints → **Support Tickets**.
- Finance handled at parent level; billing availability comes from account contract, not a selector.

## 7. Bulk Upload behavior
Two-column entry: mode (Standard/Same-Day), sender/pickup (Address Book), first-mile (pick-up + date / drop-off + "Check drop-off locations" dialog), payment, URL-or-file upload (selected-file + uploading states) → mock validation summary → confirm → success. Template "Download" generates a **CSV** (no xlsx lib) from the official 17 template columns. Frontend-only; no real parsing.

## 8. PaymentMethodTabs behavior
Billing derived from active account contract (`isBillingAccount(getCurrentAccountName())` in `data/paymentAccounts.ts`). Billing accounts: "Pay via billing" default + invoice copy; normal tabs gated behind explicit "Other payment options" and **functionally disabled** (disabled attrs + guards + pointer-events-none) until selected. Non-billing: tabs shown directly. Tabs: Cash (2-up), E-wallets (4-up; GCash available, others coming-soon/disabled), Card (mock fields), Online banking (bank select). `BrandLogo` slot map (fallback boxes; set `src` to swap real assets).

## 9. Users & Permissions behavior
Table: User / Role+account / Access / Actions. Add/Edit via Dialog ("Add user access", requires Name + email + account; subaccount → Manager). Replace-manager confirm when a subaccount already has a manager. Remove confirm; sole Admin removal disabled (no owner-transfer flow).

## 10. Address Book behavior
CRUD in local state. Cascading Province→City→Barangay from live GGX pickup API (`pickup=quad-x`) in `data/locationApi`; child selects disabled until parent chosen; save blocked unless full chain selected. Settings shows a display-only address card (`AddressDisplayCard`) routing edits here.

## 11. Mock / frontend-only limits
No real backend/API; all data is in-memory or static mock. Auth/route guards **exist** (AuthContext + ProtectedRoute/AdminRoute) but are frontend-only (no real session security). Filters/pagination/export mostly non-wired. CSV template (not xlsx). Drop-off locations mock (help-center page 403). Payment selections not persisted. SubAccount state in-memory (localStorage persistence covers auth session, notifications read-state, claims, SLA, and recent uploads — see §13).

## 12. Known DS gaps
Reusable Dialog/ConfirmDialog now exist (gap closed). Remaining: Textarea, Switch, Checkbox, Avatar, Skeleton, Dropdown Menu, Tooltip not yet componentized; real brand/payment logo assets pending.

## 13. Completed roadmap + shipped feature set
**All five planned roadmap items are complete (2026-05-30). UX fix pass and mock service layer added (2026-05-31):**
1. **Stable Subaccount IDs** — canonical `{ id, name }` map (`data/accounts.ts`) + `getCurrentAccountId()` in `SubAccountContext`; notification visibility keys off `accountId` (name = display only); bulk-upload records/events and transaction `batch.accountId` carry canonical ids.
2. **Financial Security / OTP** — reusable `OtpDialog` (mock `123456`) gating all parent-level Payment Settings actions (add/edit/remove/set primary/default), required even for Admin; mock attention-email event + security log + parent-scoped notification per verified change; financial controls hidden outside parent context.
3. **Claims & Cancellations** — `data/claims.ts` + Claims page; refund claims on undelivered transactions and cancellation of newly-booked ones, surfaced from Transaction Details; id-scoped notifications; Claims sidebar item.
4. **SLA Alerts / Operations Monitoring** — `data/slaAlerts.ts` + SLA Alerts page; No Movement / Breach SLA alerts with hub/forwarder follow-ups; follow-up/resolve actions; SLA sidebar item.
5. **Data Analytics redesign** — Business Review (Zenith PH) metric set; peak-hours removed; recharts lazy-loaded (main bundle ~997 kB → ~570 kB).

Other shipped systems: categorized **Notifications** (account-scope visibility, tabbed page, bell, sidebar), **Reports & Downloads** (accessible to Managers; finance types hidden in subaccount view), **Service Advisories**, **Support Tickets** (+ detail, mock Zendesk boundary), full **Bulk Upload** flow, Subaccounts + Users & Permissions, Address Book (live pickup API).

**UX fix pass (2026-05-31, commit 284e1b0):** 12 items, all committed and logged in IMPLEMENTATION_LOG.md:
1. Topbar search wired — grouped dropdown (transactions/claims/tickets), ×-clear, closes on nav.
2. Subaccount dashboard: "Earnings Report" card replaced with live "SLA Alerts" card in subaccount view.
3. Reports accessible to Managers; billing/settlement types hidden in subaccount view with info banner.
4. Transactions filter toolbar breakpoint `lg` → `md`.
5. New `SearchInput` component with ×-clear; replaces plain `Input` on Transactions, Claims, SLA Alerts, Support Tickets, Users & Permissions.
6. SLA Alerts card layout: badges left, CTAs side-by-side, compact follow-up note.
7. AddressBookPage gains a proper `<h1>` header; BulkUploader breadcrumb removed (top-level page).
8. Address Book delete now shows a ConfirmDialog before deleting.
9. `text-[10px]` → `text-xs` (12 px) in AddressBook.
10. Empty state consistency: Claims + SLA Alerts icon/title/container aligned.
11. All popovers (account menu, notifications, topbar search, mobile nav) auto-close on route change.
12. Users & Permissions checkbox double-toggle fixed (`pointer-events-none` on visual div).

**Mock service layer (2026-05-31, commit d89eb7a):** Infrastructure only — no UI consumers migrated.
- `src/app/data/mock/`: `accounts.mock.ts` (canonical `MOCK_MAIN_ACCOUNT` + `MOCK_SUBACCOUNTS`), `auth.mock.ts` (MockPermissions), and thin re-exports for users/transactions/notifications/bulkUploads.
- `src/app/services/`: `authService`, `accountService`, `userService`, `transactionService`, `notificationService`, `bulkUploadService` — async facades over mock data.
- `MOCK_SERVICE_LAYER.md`: full architecture doc + backend API contracts.
- **Canonical account IDs:** `main` (parent), `acme-corporation`, `acme-luzon`, `acme-visayas`.
- Deferred services: claims, SLA alerts, reports, earnings/settlements, support tickets, service advisories, payment accounts, financial security.
- All existing UI pages still read from `src/app/data/*` directly (no regression).

**Foundation/stability layer (2026-05-30):**
- **Mock auth** (`contexts/AuthContext.tsx`): `AuthUser { name, email, role, accountId, accountName }`; demo Admin + Manager; session persisted to `localStorage`. `useAuth()` is the single source of truth for role + scoped account id.
- **Route guards** (`components/RouteGuards.tsx`): `ProtectedRoute` wraps `/dashboard` (unauthenticated → Login); `AdminRoute` wraps Admin-only routes → in-shell `AccessDenied` for Managers.
- **Admin vs Manager access:** Admin = parent + all subaccount areas. Manager = subaccount nav only; **no** Finance/Payment Settings/Earnings/Billing/Reports/Subaccounts/Users (route-guarded + nav-hidden + account switcher hidden). Financial actions stay Admin-only and OTP-gated.
- **Persistence** (`lib/storage.ts`, namespaced `ggx.`): auth session, subaccount selection, seed + runtime notification read-state, claims (+cancellations), SLA alerts, recent uploads. Not persisted: OTP values, upload-event read-state, security-log/attention-email events, transient form state.
- **Notification scoping:** `useNotificationViewer()` derives from `useAuth()` — Manager → their subaccount id + global; Admin → all (or drilled-in subaccount). Visibility matches on `accountId` only.
- **Bulk Upload scoping:** a Manager uploads under their assigned subaccount (id/name/scope from the session); Admin uses the active `SubAccountContext` account. Upload records/events + completion notifications scope accordingly.

## 14. Limitations, risks & next horizon
**Mock/frontend-only limits:** no backend/API; all data is in-memory/static + `localStorage` (demo fallback only); auth is mock (`DEMO_USERS`, fixed password); analytics figures, OTP (`123456`), and Zendesk are mock; main bundle ~574 kB (slightly over warning).

**Remaining risks:** no real auth/session security (client-side only); no server-side authorization (guards are UI-only); localStorage is unencrypted and per-browser; Manager visibility is correct in notifications/bulk but a few non-critical reads (PaymentMethodTabs billing) still derive from account name; no real roles/permissions service.

**Next planning horizon — Backend / API integration** (last production-track foundation): **start with real authentication + session handling**, then replace mock data modules (transactions, claims, SLA, notifications, analytics) behind async services. Keep persistence/local mock state **only as a demo fallback** until backend exists.

**Next recommended task:** Migrate UI consumers to use the service layer — replace direct `data/*` imports with `services/*` calls in pages, starting with `transactionService` (Transactions page) and `authService` (AuthContext). No new features; no new services. This makes the seam concrete and reveals any impedance mismatches before a real backend exists. See `MOCK_SERVICE_LAYER.md` §7 for recommended migration sequence.

**Read first (future sessions):** `PROJECT_HANDOFF.md` (this file) → `ROADMAP.md` (status + horizon) → `IMPLEMENTATION_LOG.md` (per-task detail). Key code: `contexts/AuthContext.tsx`, `components/RouteGuards.tsx`, `lib/storage.ts`, `contexts/SubAccountContext.tsx`, `data/accounts.ts`, `data/notifications.ts`, `routes.tsx`, `layouts/RootLayout.tsx`.

## 15. Prompting rules for future sessions
Scope tightly (named files/flows). Mock/frontend-only unless backend pattern exists. No new deps without approval. Preserve DS + routes; don't touch unrelated pages. Run `npm run build` after edits; fix only safe errors. Update `IMPLEMENTATION_LOG.md` briefly per task. Note pre-existing uncommitted changes before staging.

## 16. Git workflow rules
Do not auto-commit — user commits manually. Provide explicit `git add <paths>` (stage only the task's files). **Commit commands must be PowerShell-safe: no multiline quoted messages — use multiple `-m` flags** for title/body. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` via a final `-m`. Keep unrelated work in separate commits.
