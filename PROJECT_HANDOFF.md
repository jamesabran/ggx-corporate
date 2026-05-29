# GGX Corporate — Project Handoff

Compact checkpoint for continuing in a fresh Claude session. For detail, see `IMPLEMENTATION_LOG.md`, `GGX_CORPORATE_APP_STRUCTURE.md`, `DS_USAGE_GUIDE.md`, `GGX_CORPORATE_DS_CONTEXT.md`.

## 1. Current state
Working React SPA, demo/mock-only (no backend). `npm run build` passes — 0 TS errors (one pre-existing recharts bundle-size warning). All 19 routes render. Login mock: `max@email.com` / `!1234qwer`.

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
Transaction detail `:id` lookup; PaymentMethodTabs (+cleanup); Bulk Upload flow + template/drop-off/payment; reusable Dialog/ConfirmDialog consolidation; Users & Permissions access mgmt; Payment Settings edit/remove; pickup-location API in Address Book; topbar/login dead-link fixes; Select chevron + button icon fixes.

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
No backend/auth/route guards. Static datasets; filters/search/pagination/export mostly non-wired. CSV template (not xlsx). Drop-off locations mock (help-center page 403). Payment selections not persisted. SubAccount state in-memory.

## 12. Known DS gaps
Reusable Dialog/ConfirmDialog now exist (gap closed). Remaining: Textarea, Switch, Checkbox, Avatar, Skeleton, Dropdown Menu, Tooltip not yet componentized; real brand/payment logo assets pending.

## 13. Completed roadmap + shipped feature set
**All five planned roadmap items are complete (2026-05-30):**
1. **Stable Subaccount IDs** — canonical `{ id, name }` map (`data/accounts.ts`) + `getCurrentAccountId()` in `SubAccountContext`; notification visibility keys off `accountId` (name = display only); bulk-upload records/events and transaction `batch.accountId` carry canonical ids.
2. **Financial Security / OTP** — reusable `OtpDialog` (mock `123456`) gating all parent-level Payment Settings actions (add/edit/remove/set primary/default), required even for Admin; mock attention-email event + security log + parent-scoped notification per verified change; financial controls hidden outside parent context.
3. **Claims & Cancellations** — `data/claims.ts` + Claims page; refund claims on undelivered transactions and cancellation of newly-booked ones, surfaced from Transaction Details; id-scoped notifications; Claims sidebar item.
4. **SLA Alerts / Operations Monitoring** — `data/slaAlerts.ts` + SLA Alerts page; No Movement / Breach SLA alerts with hub/forwarder follow-ups; follow-up/resolve actions; SLA sidebar item.
5. **Data Analytics redesign** — Business Review (Zenith PH) metric set; peak-hours removed; recharts lazy-loaded (main bundle ~997 kB → ~570 kB).

Other shipped systems: categorized **Notifications** (account-scope visibility, tabbed page, bell, sidebar), **Reports & Downloads**, **Service Advisories**, **Support Tickets** (+ detail, mock Zendesk boundary), full **Bulk Upload** flow, Subaccounts + Users & Permissions, Address Book (live pickup API).

## 14. Current limitations & next recommended task
**Mock/frontend-only limits:** no backend; in-memory/static data **resets on full reload**; login is a hardcoded mock with **no real auth and no route guards** (any `/dashboard/*` URL is directly reachable); demo user is always Admin (Manager visibility implemented but untriggered); OTP/Zendesk/analytics figures are mock.

**Remaining foundations (sequence): real authentication + route guards → persistence/localStorage → backend/API integration.**

**Next recommended task: Authentication + Route Guards.** Add an auth/session context (mock-backed) exposing `isAuthenticated` + current user/role/account; wrap `/dashboard/*` in a `ProtectedRoute`/guard that redirects unauthenticated users to `/`; wire the existing mock login/logout to set/clear the session; structure the boundary so a real auth API drops in cleanly. **Do this before persistence** — persisted state should be keyed to the authenticated user/account, and the session becomes the single source of truth (role/account id) that persistence, real APIs, and notification scoping all consume, avoiding rework.

See **ROADMAP.md** for the full completed log, shipped feature set, next planning horizon, and auth risks/assumptions.

## 15. Prompting rules for future sessions
Scope tightly (named files/flows). Mock/frontend-only unless backend pattern exists. No new deps without approval. Preserve DS + routes; don't touch unrelated pages. Run `npm run build` after edits; fix only safe errors. Update `IMPLEMENTATION_LOG.md` briefly per task. Note pre-existing uncommitted changes before staging.

## 16. Git workflow rules
Do not auto-commit — user commits manually. Provide explicit `git add <paths>` (stage only the task's files). **Commit commands must be PowerShell-safe: no multiline quoted messages — use multiple `-m` flags** for title/body. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` via a final `-m`. Keep unrelated work in separate commits.
