# GGX Corporate — Implementation Log

**Date:** 2026-05-29
**Stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS v4 + shadcn-style UI + react-router 7
**Status:** Initial build complete. `npm run build` passes (tsc + vite, 0 errors).

---

## 1. Completed Work (Page by Page)

### Login (`/`)
- Two-panel layout: login form (left) + feature showcase card (right)
- Login form: email + password + remember me + social login buttons (Facebook, Google, Apple — UI only)
- Registration form: toggle from login, collects company name, volume, price range, contact info
- Client-side auth: `max@email.com` / `!1234qwer` → navigate to `/dashboard`; else `alert()`
- "Forgot password?" and support link are `<a href="#">` stubs

### Dashboard (`/dashboard` — standard or subaccount view)
- 4 KPI stat cards: Active Deliveries, Pending Pickups, Failed/Delayed, Monthly Spend
- 4 Quick Action cards linking to Bulk Uploader, Billing, API Access, Support Tickets
- 3 side-by-side panels: Recent Transactions (5 rows), Earnings Report (3 rows), Delivery Performance
- Subaccount banner shown when viewing a specific subaccount (not main)
- `DashboardWrapper` decides between `Dashboard` and `ParentDashboard` based on `isMainAccountView()`

### ParentDashboard (`/dashboard` — main account view)
- 4 consolidated KPI cards: Total Shipments, Total COD, Active Subaccounts, Failed Deliveries
- 4 Quick Actions: Add Subaccount, Invite User, View Reports, View Finance
- Subaccount Performance table (2 subaccounts with shipments/revenue/success rate)
- Recent Activity feed (4 items with type icons)

### Transactions (`/dashboard/transactions`)
- Full table: tracking number, recipient, destination, [subaccount if main view], type, status badge, date, View button
- Filters: search input, subaccount select (main view only), status select, type select
- Note: filters render but do not currently filter the static data array
- Pagination UI (Previous/Next buttons — non-functional)
- Export CSV button (non-functional)

### Transaction Details (`/dashboard/transactions/:id`)
- Static transaction data (does not use URL param to look up real records)
- Pickup/Delivery dates, Sender/Recipient details, Order Summary with items+pricing
- Packaging info, Transaction Fees breakdown, Payment Method
- Star rating widget (state stored locally, not persisted)
- Tracking Timeline with 7 events, proof-of-delivery links (stubs)
- "Send a Report" and "Upload New Delivery" buttons
- "Need Help?" card at bottom

### Bulk Uploader (`/dashboard/bulk-uploader`)
- Standard / Same-Day delivery mode toggle
- Pickup address display with "Change Address" button that embeds the AddressBook in select mode
- File upload drop zone (clicking/dropping navigates to summary — simulated)
- Recent Uploads table (4 rows) with click-to-view-summary
- Template download buttons (non-functional), requirements sidebar card

### Bulk Upload Summary (`/dashboard/bulk-upload-summary`)
- Reads `:id` param from URL for display only; always shows same 5-row mock data
- Validation summary: total rows, valid count, error count
- Data preview table with per-row validation status and error messages
- "Proceed with Valid Bookings" button (enabled only when validRows > 0)

### Data Analytics (`/dashboard/analytics`)
- 4 stat cards: Total Deliveries, Success Rate, Avg Delivery Time, Failed Deliveries
- Period and brand filter selects (UI only)
- Bar chart: Monthly Delivery Volume (recharts BarChart)
- Pie chart: Delivery Status Breakdown (recharts PieChart)
- Line chart: On-Time Performance (recharts LineChart)
- 3 info panels: Top Destinations, Delivery Types, Peak Hours

### Earnings (`/dashboard/earnings`)
- 4 summary cards: Available for Payout, Pending Collection, Scheduled Deposit, Remitted This Month
- Primary Bank Account display
- Settlement History table with status badges; subaccount column shown in main account view
- Source / status / date / subaccount filters (UI only)
- Pagination UI (non-functional)

### Billing Statements (`/dashboard/billing`)
- 4 summary cards: Current Balance, Due This Month, Overdue, Last Payment
- Payment method on file card with link to PaymentSettings
- Invoice History table with status badges, download buttons, "Pay Now" for pending
- Subaccount filter in main account view
- Billing contact and payment method summary cards at bottom

### Payment Settings (`/dashboard/payment-settings`)
- Payment Methods section: 2 cards (Visa default + Mastercard), Add Payment Method button
- Auto-Pay "Coming Soon" notice card
- Payout Bank Accounts section: BDO (primary, verified) + BPI (pending verification)
- Payout Schedule and Verification info cards
- All edit/remove/set-default buttons are stubs

### Address Book (`/dashboard/address-book`)
- Wraps `AddressBook` component in `full` mode
- Full CRUD: add, edit, delete, set default address — all functional in local state
- Search by name/city/province, filter by label type
- Address form: label, name, mobile, province/city/barangay cascade, other details, preferred toggle
- Province/city/barangay data is partially populated (limited coverage)

### API Integration (`/dashboard/api-access`)
- API Documentation link card
- Environment toggle (Sandbox / Production) with warning banner in production mode
- API key display (masked/shown with eye button), copy to clipboard, Generate New Key button
- Quick Stats sidebar (API calls today, rate limit, system status)
- Webhook URL configuration, event subscription checkboxes
- Save/Test Webhook buttons (non-functional)
- Security Best Practices card

### Support Tickets (`/dashboard/support-tickets`)
- 4 summary cards: Open, In Review, Resolved, Avg Response Time
- "Submit a Ticket" form panel (toggleable): tracking number, issue type, description
- Tickets table with priority + status badges, assignee, last update
- Status and type filters (UI only)
- Pagination UI (non-functional)

### Subaccounts (`/dashboard/subaccounts`)
- Gate: shows "not enabled" screen with Enable Subaccounts CTA when `subAccountsEnabled = false`
- When enabled: lists all subaccounts with manager, pickup address, booking count
- Per-subaccount actions: View Dashboard (switches context + navigates), Manage Users, Settings (stubs)
- Request Additional Subaccount button

### Enable Subaccounts Intro (`/dashboard/subaccounts/enable`)
- Explains how subaccounts work, 4 benefit cards
- "Not Now" → Settings, "Continue" → Enable Setup

### Enable Subaccounts Setup (`/dashboard/subaccounts/enable/setup`)
- Shows prefilled Main Account data and Default Subaccount info
- "Enable Subaccounts" calls `enableSubAccounts()` context function
- Success screen confirms activation, links to Request Subaccount or Dashboard

### Request Additional Subaccount (`/dashboard/subaccounts/request`)
- Form: Business Info (name, type, address, pickup address, billing ref) + Operational Details (volume, start date, manager, role) + Notes
- On submit: calls `addSubAccount()` context function, shows success confirmation
- Success screen notes prototype behavior (real flow requires Sales review)

### Users & Permissions (`/dashboard/users-permissions`)
- Available only in main account navigation
- User list: 4 hardcoded users with name, email, role badge, level, access scope
- Role Definitions section: Parent-level roles (Owner, Admin, Finance, Viewer) + Subaccount roles (Manager, Operator, Viewer)
- "Invite User" and "Edit" buttons are stubs

### Settings (`/dashboard/settings`)
- "Enable Subaccounts" promo card (shown only when subaccounts not enabled)
- Account Information form: company, email, phone, address (Save/Cancel — non-functional)
- Notifications preferences with checkboxes (non-functional)
- Security: Change Password button, 2FA toggle (non-functional)

---

## 2. Files Created / Modified

### Configuration
- `package.json` — dependencies and scripts
- `vite.config.ts` — Vite + React + Tailwind v4 plugin + `@/` alias
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript composite project
- `index.html` — root HTML with Inter font via Google Fonts

### Styles
- `src/index.css` — imports Tailwind and theme
- `src/styles/theme.css` — CSS custom properties (design tokens, Tailwind @theme inline)

### App entry
- `src/main.tsx` — React root render
- `src/app/App.tsx` — RouterProvider wrapper

### Routing
- `src/app/routes.tsx` — all 19 routes

### Layout
- `src/app/layouts/RootLayout.tsx` — sidebar, topbar, account switcher, logout modal

### Context
- `src/app/contexts/SubAccountContext.tsx` — subaccount state, enable/add/switch functions

### Utilities
- `src/app/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### UI Components (all new)
- `src/app/components/ui/Button.tsx`
- `src/app/components/ui/Badge.tsx`
- `src/app/components/ui/Card.tsx`
- `src/app/components/ui/Input.tsx`
- `src/app/components/ui/Select.tsx`
- `src/app/components/ui/Table.tsx`
- `src/app/components/ui/Tabs.tsx`

### Application Components (new)
- `src/app/components/AddressBook.tsx`

### Pages (all new)
- `src/app/pages/Login.tsx`
- `src/app/pages/Dashboard.tsx`
- `src/app/pages/ParentDashboard.tsx`
- `src/app/pages/DashboardWrapper.tsx`
- `src/app/pages/Transactions.tsx`
- `src/app/pages/TransactionDetails.tsx`
- `src/app/pages/BulkUploader.tsx`
- `src/app/pages/BulkUploadSummary.tsx`
- `src/app/pages/DataAnalytics.tsx`
- `src/app/pages/Earnings.tsx`
- `src/app/pages/BillingStatement.tsx`
- `src/app/pages/PaymentSettings.tsx`
- `src/app/pages/AddressBookPage.tsx`
- `src/app/pages/APIAccess.tsx`
- `src/app/pages/SupportTickets.tsx`
- `src/app/pages/SubAccounts.tsx`
- `src/app/pages/EnableSubAccounts.tsx`
- `src/app/pages/EnableSubAccountsSetup.tsx`
- `src/app/pages/RequestSubAccount.tsx`
- `src/app/pages/UsersPermissions.tsx`
- `src/app/pages/Settings.tsx`

### Existing reference files (not modified)
- `GGX_CORPORATE_DS_CONTEXT.md` — design system reference document

---

## 3. DS Components Used (from GGX-SHADCN Design System)

| DS Component | Code File | Notes |
|---|---|---|
| Button | `ui/Button.tsx` | All variants used throughout |
| Badge | `ui/Badge.tsx` | Status variants used heavily |
| Card / CardHeader / CardContent / CardTitle / CardDescription / CardFooter | `ui/Card.tsx` | Used on every page |
| Input | `ui/Input.tsx` | Forms throughout |
| Native Select | `ui/Select.tsx` | Filters and forms |
| Table / TableHeader / TableBody / TableRow / TableHead / TableCell | `ui/Table.tsx` | Transactions, Earnings, Billing, Bulk, Support Tickets |
| Tabs / TabsList / TabsTrigger / TabsContent | `ui/Tabs.tsx` | Available but not actively used in current pages |

---

## 4. New Local App-Level Components Created

| Component | File | Purpose |
|---|---|---|
| AddressBook | `components/AddressBook.tsx` | Full-featured CRUD address book; used in AddressBookPage (full mode) and BulkUploader (select mode) |
| RootLayout | `layouts/RootLayout.tsx` | Shell: sidebar nav, topbar, account switcher, logout modal |
| SubAccountProvider | `contexts/SubAccountContext.tsx` | In-memory state for subaccount feature |
| DashboardWrapper | `pages/DashboardWrapper.tsx` | Selects Dashboard vs ParentDashboard based on account view |

---

## 5. DS Gaps Discovered

### DS Gap: Form Error / Invalid States
- Figma Make reference: Login uses `alert()` for invalid credentials; no inline field error styling exists in the Make file.
- Current workaround: `alert()` retained verbatim from Make file.
- Recommended DS addition: `State=error` on Input and Select components with red ring + below-field helper text. DS context §8 already flags this as unresolved.
- Risk level: medium — required before any form with real validation ships.

### DS Gap: Sidebar Component
- Figma Make reference: Sidebar in the Make file is fully custom Tailwind (not using the DS `Sidebar` component page).
- Current workaround: ported the custom sidebar verbatim into `RootLayout.tsx`. Includes mobile slide-in, subaccount switcher panel, Finance accordion section.
- Recommended DS addition: reconcile the DS Sidebar page with this implementation; either adopt the Make file's sidebar as the canonical DS Sidebar or document the divergence.
- Risk level: low for POC; medium when enforcing DS compliance.

### DS Gap: Avatar with Initials
- Figma Make reference: topbar and sidebar use gradient+initials avatar pattern (blue gradient circle, white initials, configurable size).
- Current workaround: implemented inline in `RootLayout.tsx` using Tailwind `bg-gradient-to-br from-blue-600 to-blue-700`.
- Recommended DS addition: `Avatar` component with an `initials` variant that accepts a string and generates the gradient+initials display.
- Risk level: low.

### DS Gap: KPI Stat Card Pattern
- Figma Make reference: Dashboard and ParentDashboard use colored-background stat cards (pastel bg, icon in darker bg square, title/value/trend).
- Current workaround: implemented inline in Dashboard.tsx and ParentDashboard.tsx using inline `cardBg`/`iconBg` string props on a data array.
- Recommended DS addition: a named `KPICard` or `StatCard` pattern in the DS with defined slots for icon, value, label, trend.
- Risk level: low.

### DS Gap: Notification Dot on Icon
- Figma Make reference: topbar bell icon has a small red dot indicator.
- Current workaround: `<span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />` inline in `RootLayout.tsx`.
- Recommended DS addition: a Badge `Display=dot` variant or a notification indicator utility.
- Risk level: low.

### DS Gap: Toggle Switch (Inline)
- Figma Make reference: API Access page uses an inline toggle for Sandbox/Production environment switching.
- Current workaround: custom `<button>` with conditional classes in `APIAccess.tsx`.
- Recommended DS addition: use the DS `Switch` component (already defined in DS). Requires wiring to a boolean state — the gap is that the DS Switch component was not ported into code yet.
- Risk level: low.

### DS Gap: Textarea Component
- Figma Make reference: multiple pages use `<textarea>` elements (Login registration, AddressBook, RequestSubAccount, Support Tickets).
- Current workaround: raw `<textarea className="... border border-gray-300 ... focus:ring-primary ...">` inline in each page.
- Recommended DS addition: a `Textarea` UI component at `src/app/components/ui/Textarea.tsx` matching the Input style.
- Risk level: low — purely cosmetic consistency.

---

## 6. Assumptions Made

1. **Button `variant="danger"` → `variant="destructive"`** — DS and shadcn use `destructive`. The Make file used `danger`. Standardised to `destructive` throughout.
2. **Button `size="md"` → `size="default"`** — DS uses `default` as the size name. Aligned to that.
3. **Tabler Icons used exclusively** — The Make file referenced Lucide icons. All icons were migrated to `@tabler/icons-react` equivalents as specified in `GGX_CORPORATE_DS_CONTEXT.md`.
4. **recharts `percent` guard** — PieChart label uses `(percent ?? 0)` because recharts v2 types `percent` as optional. Safe defensive guard.
5. **Static mock data is intentional for POC** — Data arrays embedded in each page file are the correct approach for a prototype; no API layer exists.
6. **No route guards** — Authentication is client-side mock only; routes are not protected. Intentional for POC.
7. **SubAccountContext state does not persist** — Enabling subaccounts and switching accounts resets on page reload. Intentional for POC — no localStorage or backend.
8. **AddressBook CRUD is local state only** — Addresses do not persist across navigation. Intentional for POC.
9. **`@types/node` added as devDep** — Required for `node:url` typing in `vite.config.ts` when using `fileURLToPath`.

---

## 7. Deferred Blockers

### Blocker: Real Authentication
- Area affected: `src/app/pages/Login.tsx`, all routes
- Why deferred: No backend API exists. POC scope only.
- Recommended decision: implement JWT/session auth with a real backend endpoint, add route guards using a `ProtectedRoute` wrapper around the `/dashboard` layout.
- Workaround used: hardcoded credential check (`max@email.com` / `!1234qwer`) with `navigate('/dashboard')` on success.
- Status: deferred

### Blocker: Route Guards
- Area affected: all `/dashboard/*` routes in `src/app/routes.tsx`
- Why deferred: depends on real authentication being in place.
- Recommended decision: wrap `RootLayout` in an auth check; redirect to `/` if no valid session exists.
- Workaround used: none — all routes are open.
- Status: deferred

### Blocker: Real Data Layer
- Area affected: all pages with data tables (Transactions, Earnings, Billing, Support Tickets, Bulk Upload)
- Why deferred: no API contract defined. POC uses static mock arrays.
- Recommended decision: define API contracts, add React Query or SWR for data fetching, move mock data to a mock server or fixture files.
- Workaround used: hardcoded `const` arrays at the top of each page file.
- Status: deferred

### Blocker: Inline Form Validation
- Area affected: Login, Registration, RequestSubAccount, Support Tickets new ticket form, AddressBook form
- Why deferred: DS `Input` error state does not exist yet.
- Recommended decision: add `State=error` to the Input DS component, create error/helper-text pattern, then apply `react-hook-form` or similar for form state.
- Workaround used: `alert()` for auth error; HTML5 `required` attribute for other forms.
- Status: deferred

### Blocker: Lazy Loading / Code Splitting
- Area affected: `src/app/pages/DataAnalytics.tsx` (recharts), all routes
- Why deferred: POC does not require optimization.
- Recommended decision: use `React.lazy` + `Suspense` on the DataAnalytics route to split recharts (~300 kB) into a separate chunk.
- Workaround used: all routes in single bundle, 871 kB total.
- Status: deferred

---

## 8. Known Issues

1. **Bundle size 871 kB** — recharts is not code-split. Not a production issue for a POC.
2. **`alert()` for login errors** — should be inline field validation.
3. **TransactionDetails ignores URL param** — same static transaction always shown regardless of which tracking number was clicked.
4. **Filters do not filter data** — all select/input filters on Transactions, Earnings, Billing, Support Tickets render but the filtering logic is not wired to the displayed data.
5. **Pagination is non-functional** — Previous/Next buttons render with `disabled` on Previous, but clicking Next does nothing.
6. **Logo loaded from external CDN** — `https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png` will fail offline.
7. **Province/city/barangay coverage is incomplete** — AddressBook location cascade only covers a subset of Philippine locations.
8. **SubAccountContext resets on reload** — no persistence layer.

---

## 9. Validation Results

### Build (`npm run build`)
```
tsc -b && vite build
✓ built in 6.73s
0 errors, 0 warnings (TypeScript)
1 warning (Vite): single chunk 871 kB — expected, recharts-related
```

### TypeScript (`tsc -b`)
- 0 errors
- All props typed explicitly
- All context values typed with interfaces
- No `any` escapes

### Lint
- No lint tool configured (`npm run lint` not defined in `package.json`)
- ESLint / Prettier not installed

---

## 10. Next Recommended Steps

**Priority 1 — Before showing to stakeholders:**
1. Replace `alert()` login error with inline field error state (add `State=error` to Input DS component first)
2. Fix TransactionDetails to actually use the `:id` param and look up the correct record from the mock data array

**Priority 2 — Before any real user testing:**
3. Add route guards (protect all `/dashboard/*` routes)
4. Wire filter state to the data arrays on Transactions, Earnings, Billing, Support Tickets pages
5. Make pagination functional (slice the data arrays)
6. Add a `Textarea` UI component to replace the raw `<textarea>` elements

**Priority 3 — Before production:**
7. Add real authentication backend
8. Replace static data arrays with API calls (React Query recommended)
9. Add `React.lazy` to DataAnalytics route to code-split recharts
10. Port the DS `Switch` component to code and use it in APIAccess environment toggle
11. Add `localStorage` persistence for SubAccountContext (or move to backend session)
12. Bundle the logo locally instead of loading from external CDN

---

## Refactor — Complaints → Support Tickets (2026-05-29)

Terminology rename of the Complaints feature to Support Tickets. Rename only — no logic or design-system changes.

**Naming applied:**
- Page label: Support Tickets · Singular: Ticket · CTA: Submit a Ticket
- Component `Complaints` → `SupportTickets`
- File `pages/Complaints.tsx` → `pages/SupportTickets.tsx` (via `git mv`, history preserved)

**Route changes:**
- Routes are nested under `/dashboard`, so the new path is `/dashboard/support-tickets` (preserves existing structure; the requested `/support-tickets` would break the nested-layout pattern used by every other page).
- Added backward-compat redirect: `/dashboard/complaints` → `/dashboard/support-tickets` via `<Navigate replace />`.
- No detail route existed for this feature; `/support-tickets/:id` / "Ticket Details" were **not** created (out of rename scope — would be a new feature).

**Copy changes:**
- "File New Complaint" (header button + form title) → "Submit a Ticket"
- "Submit Complaint" → "Submit Ticket"
- "File support tickets…" → "Submit support tickets…"
- Dashboard quick action "File a Complaint" → "Submit a Ticket"

**Files changed:**
- `src/app/pages/SupportTickets.tsx` (renamed + copy)
- `src/app/routes.tsx` (import, path, redirect, `Navigate` import)
- `src/app/layouts/RootLayout.tsx` (3× nav href)
- `src/app/pages/Dashboard.tsx` (quick action label + href)
- Docs: `IMPLEMENTATION_LOG.md`, `GGX_CORPORATE_APP_STRUCTURE.md`, `DS_USAGE_GUIDE.md`, `PROJECT_CHECKPOINT.md`

**Remaining "complaint" references:** Only the intentional redirect path string `'complaints'` in `routes.tsx`. No other code or doc references remain.

**Validation:** `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning remains.

---

## Audit & Action Plan (2026-05-29)

Implementation audit of the working baseline. No code changes made. All 19 routes resolve; no broken `navigate()`/`<Link>` targets. Issues are dead-end CTAs (no handler), two DS-component UI bugs, and stubbed management actions.

**Fix now:** Select chevron flush to edge (Select.tsx); button icon squish (no `shrink-0`); topbar account menu items (My Profile/Security/Preferences) have no handler; notification bell dead-ends; TransactionDetails ignores `:id` (always same record); Login dead links (Forgot password `#`, support email `#`, social buttons no-op).

**Build next (implied, not new Figma pages):** Invite User flow (evidence: UsersPermissions "Invite User" + ParentDashboard CTA — stubs); Edit/Remove actions on PaymentSettings & UsersPermissions (stubs).

**Polish later:** pagination wiring; search/filter wiring; Export/Download actions; loading skeletons & empty states; recharts lazy-load; replace raw `<textarea>`/checkboxes with DS Textarea/Switch; logout modal → DS Dialog; avatar initials → DS Avatar.

**Needs user decision:** Forgot Password page (inferred from Login link only — NOT in Figma Make); Notifications page vs. popover; whether My Profile/Security/Preferences are separate pages or Settings sections; real auth + route guards scope.

**Defer:** real API integration; auth backend; SubAccountContext persistence; dark mode; auto-pay; webhook save/test.

**DS component gaps (in DS, not yet in code):** Textarea, Switch, Checkbox, Dialog, Avatar, Skeleton, Dropdown Menu, Tooltip.

---

## Planned — Address Book Pickup-Location API Integration (Build Next / Data Integration)

**Status:** In progress (2026-05-29)

Integrate the GGX pickup-location API into Address Book and align the Settings → Account Information address with the Address Book card pattern.

- Source: `https://api.gogox.ph/v1/locations/*?pickup=quad-x` (pickup-supported locations only)
- Cascading Province → City/Municipality → District/Barangay selects, each fetched by parent ID
- Child selects disabled until parent selected; children reset when parent changes
- Block save if the location chain is incomplete (enforces pickup-supported-only)
- Street/building/unit/landmark remain free-text details
- Account Information becomes a display-focused Address Card; editing routes to Address Book

### Result — Address Book Pickup-Location API Integration (Done, 2026-05-29)

**API integration**
- New service `src/app/lib/locationApi.ts`: `getProvinces()`, `getCities(provinceId)`, `getDistricts(cityId)`.
- All requests scoped with `pickup=quad-x&per_page=1000&extended=1` so only GGX pickup-supported locations are returned.
- Typed against the real response: paginated envelope `{ data: LocationApiItem[], total, per_page, ... }`; normalized to `LocationOption { id, name, postalCode }`. The API returns the string `"null"` for missing postal codes — normalized to `""`.
- Uses native `fetch` (no existing API client). Throws on non-OK status and unexpected shape; callers map errors to inline UI copy.

**Address Book cascade**
- `Address` extended with `provinceId`, `cityId`, `districtId`, `postalCode`.
- Province → City/Municipality → Barangay selects, each fetched using the parent's API ID.
- Child selects disabled until the parent is chosen; changing a parent resets all descendants and refetches.
- Loading text per select ("Loading cities…"), empty text ("No pickup cities"), and an inline error row on fetch failure.
- Province options load when the form opens; editing an address with stored IDs rehydrates its city/barangay options.

**Location validation behavior**
- Save is blocked unless `provinceId`, `cityId`, and `districtId` are all set — and because the selects are populated only from `pickup=quad-x` results, a valid selection is by definition pickup-supported.
- Legacy seed addresses (no IDs) display normally but must be re-selected through the cascade before they can be saved.
- Helper copy in the form: "Only GGX pickup-supported locations can be saved for pickup bookings."
- Street/building/unit/landmark stay in the free-text "Other Location Details" field.

**Account Information address card**
- New shared presentational `src/app/components/AddressDisplayCard.tsx` renders the address pattern (label badge, name, mobile, location line, postal code, details). Used by both Address Book entries and Settings.
- Settings → Account Information now shows a display-only Address Card (no separate address/city/province/zip inputs) with an "Edit in Address Book" button routing to `/dashboard/address-book`. Address Book remains the source of truth; no separate address model.

**Files changed**
- Added: `src/app/lib/locationApi.ts`, `src/app/components/AddressDisplayCard.tsx`
- Modified: `src/app/components/AddressBook.tsx` (API cascade, validation, shared card), `src/app/pages/Settings.tsx` (address card display)

**API assumptions**
- `pickup=quad-x` is the canonical pickup-supported source (same endpoints without it return all locations).
- `per_page=1000` returns the full list in one page for every level at current data volumes (provinces ~7, cities ~17, districts ≤ ~188); no client pagination implemented.
- District `postal_code` (e.g. "1400/1408") is treated as the address postal/ZIP code.

**Blockers**
- None at build time. The API responds successfully from the dev environment (verified via direct request). Browser CORS was not separately verified at runtime — if requests are blocked in-browser, the service abstraction is already isolated in `locationApi.ts` and only error-state copy would show; no workarounds/hacks were added.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning remains.

### Follow-up — Dashboard Recent Transactions aligned to shared dataset (2026-05-29)

Dashboard "Recent Transactions" used its own inline mock data, including one tracking number (`GGX-2024-89230`) absent from the shared dataset — clicking it hit the not-found state. Recent rows are now derived from `deliveries` in `src/app/data/transactions.ts` (first 5), with a Dashboard-only `updated` relative-time label, and reuse the shared `statusConfig`. Every row now links to an existing transaction. No layout or DS changes.

- Files changed: `src/app/pages/Dashboard.tsx`
- Validation: `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

### Fix Now #3 — Topbar dead-end interactions resolved (2026-05-29)

Wired the previously inert topbar controls in `RootLayout.tsx`:
- Account-menu items "My Profile", "Security", and "Preferences" now navigate to `/dashboard/settings` and close the menu (no separate profile/security/preferences routes exist).
- Notification bell now opens a small popover (same outside-click overlay pattern as the account menu) showing a short static list of notifications, with a "No new notifications" empty state and the red dot shown only when items exist.
- No layout, routing, or DS changes; uses existing Tabler icons (IconPackage, IconReceipt, IconBell).

- Files changed: `src/app/layouts/RootLayout.tsx`
- Validation: `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

### Fix Now #6 — Login page dead links resolved (2026-05-29)

Resolved the inert links on the Login page (`src/app/pages/Login.tsx`):
- Support contact `href="#"` → real `mailto:support@gogoxpress.com`.
- Social login buttons (Facebook/Google/Apple) marked `disabled` with `opacity-60 cursor-not-allowed` and a "Coming soon" title (no OAuth implemented).
- "Forgot password?" anchor → button toggling a small inline helper directing users to email support (no reset route created; remains a Needs-decision item).
- No new routes, dependencies, layout, or DS changes.

- Files changed: `src/app/pages/Login.tsx`
- Validation: `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

### Build Next — Users & Permissions access management + Payment Settings edit/remove (2026-05-29)

**Simplified Admin/Manager access model**
- Two roles only: `Admin` and `Manager`. One Admin (main account holder) with access to all accounts; each subaccount has at most one Manager tied to that single subaccount.
- Removed the old multi-role/multi-level model (Owner/Admin/Finance/Viewer/Operator), the `Level` column, and the "Role Definitions" section (no longer applicable).
- Seed: 1 Admin (John Doe) + 2 Managers (Acme Corporation, Acme Luzon).

**User List layout**
- Rebuilt as a DS `Table` with columns: User (avatar + name + email grouped) · Role / Assigned account · Access · Actions (right-aligned, compact).
- Admin → Role `Admin`, Access `All accounts`. Manager → Role `Manager · [Subaccount]`, Access `Assigned subaccount only`.
- Removed scattered right-aligned metadata and the per-field mini-labels.

**Add User flow**
- CTA relabeled "Add User"; modal titled "Add user access" with helper "Assign a user to manage an account or subaccount."
- Fields: email + account select. Role is derived: subaccount → Manager. The Main-account/Admin option is shown but disabled ("Admin already assigned") since only one Admin is allowed.
- New name is derived from the email local part.

**Manager replacement behavior**
- Adding/editing a Manager into a subaccount that already has one triggers a replace confirmation dialog stating the existing manager (name + email) will lose access to that subaccount. On confirm, the existing manager is removed from local state and the new assignment applied.

**Edit / Remove actions**
- Users: Edit opens the same modal pre-filled — Manager can change email + assigned subaccount (with replace confirmation if the target subaccount is taken); Admin edit updates email only (role/access locked). Remove uses a confirmation dialog. The sole Admin's Remove is disabled (no account-owner transfer flow exists — see assumptions).
- Payment Settings: converted payment methods and bank accounts to local state. Edit opens a modal (cardholder/account name + expiry for cards; account name for banks). Remove opens a confirmation dialog and deletes locally.

**Files changed**
- `src/app/pages/UsersPermissions.tsx` (rewritten)
- `src/app/pages/PaymentSettings.tsx` (rewritten)

**Assumptions**
- No DS `Dialog` component exists; reused the app's inline modal pattern (`fixed inset-0 bg-gray-900/50…`). DS gap: a reusable Dialog/ConfirmDialog component would consolidate the now-several modal instances.
- The sole Admin cannot be removed and the Admin role cannot be reassigned in-UI; there is no account-owner transfer flow, so that action is disabled.
- Subaccount list for assignment is a local mock (`Acme Corporation`, `Acme Luzon`) mirroring the Transactions filters; not yet sourced from SubAccountContext.
- Payment Settings "Set as Default"/"Set as Primary" remain stubs — out of the requested edit/remove scope; left unchanged.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning remains.
