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

### Follow-up — Name field added to Add User flow (2026-05-29)

Added a required Name field to the "Add user access" modal in Users & Permissions. The name is captured in local user state (replacing the previous derive-from-email behavior; `nameFromEmail` helper removed) and is pre-filled on Edit. Submit is blocked when name is empty; email/account validation unchanged. The User List already displays name + email per row, so no layout change was needed. Admin/Manager model and replace-manager behavior unchanged.

- Files changed: `src/app/pages/UsersPermissions.tsx`
- Validation: `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

### Build Next — Bulk Upload flow improvements (2026-05-29)

Improved the Bulk Upload flow using the Figma prototype (BULK-UPLOAD, node 658-11047) as a UX reference only; all styling uses the GGX Corporate DS (not Figma styling).

**Bulk Upload flow summary**
- Entry (`BulkUploader`): added breadcrumb (Transactions › Bulk Upload), kept Standard vs Same-Day mode toggle, restructured into a two-column config + upload layout.
  - Left: Sender/Pickup details (Address Book select), First-mile (Pick-up vs Drop-off) + Pick-up Date, Payment method select ("Choose how to pay for GoGo Xpress fees").
  - Right: Upload Orders via sheet/file URL (Import) OR file drag-drop/browse with a real selected-file state (name + size, remove) and an "Upload & Validate" CTA showing a brief uploading state before navigating to the summary. Template & resources card retained.
  - Recent Uploads table retained with a note that completed uploads appear in Transactions.
- Summary (`BulkUploadSummary`): kept validation summary + data preview; added a submit confirmation dialog → success/processed state (batch submitted, links to Transactions / upload another). Added an all-invalid notice when validRows === 0 and a skipped-rows note when some rows have errors.

**Figma prototype flow assumptions**
- The prototype's single config screen was interpreted as the entry/upload step; data preview, confirm, and success were mapped onto the existing summary route. Pickup/drop-off, pickup date, and payment options were inferred from the prototype's left column.
- "Up to 1,000 orders" used from the prototype intro copy (the drop zone in the proto says 200); kept 1,000 to match the headline. Low-risk copy choice.

**Files changed**
- `src/app/pages/BulkUploader.tsx` (rewritten)
- `src/app/pages/BulkUploadSummary.tsx` (confirm + success + empty/all-invalid states)

**Mock / frontend-only limitations**
- No real file parsing or upload. Selecting a file captures name/size only; "Upload & Validate" and URL "Import" both navigate to the same mock validation summary (`UPLOAD-2026-05-19-001`).
- The summary's rows are static mock data; validRows/invalidRows are derived from it. Submit sets local success state only — no backend.
- Payment method, pickup date, and first-mile selections are local state and not yet persisted or passed to the summary.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning.

**Deferred**
- Real file parsing/validation and per-row inline editing of error rows.
- Carrying pickup/payment/mode selections into the summary and success batch.

### Polish — Reusable Dialog/ConfirmDialog component (DS gap closed, 2026-05-29)

Added `src/app/components/ui/Dialog.tsx` exporting a base `Dialog` (scrim + centered panel matching the prior inline `fixed inset-0 bg-gray-900/50…` pattern; props: `open`, `onClose`, `title`, `children`, `size` sm/md, `elevated` for stacked z-index) and a `ConfirmDialog` wrapper (`title`, `description`, `confirmLabel`/`cancelLabel`, `variant` default/destructive, `onConfirm`, `confirmIcon`, optional `children`).

Refactored all inline modals to use them — no visual/behavioral/copy changes, pure consolidation:
- `RootLayout` — logout confirm → `ConfirmDialog`
- `UsersPermissions` — Add/Edit modal → `Dialog`; replace-manager confirm (elevated) and remove confirm → `ConfirmDialog`
- `PaymentSettings` — edit modal → `Dialog`; remove confirm → `ConfirmDialog` (with extra warning content via children)
- `BulkUploadSummary` — submit confirm → `ConfirmDialog`

Verified the only remaining `bg-gray-900/50` reference is inside `Dialog.tsx`. This closes the previously logged DS gap (no reusable Dialog component).

- Files changed: `src/app/components/ui/Dialog.tsx` (new), `src/app/layouts/RootLayout.tsx`, `src/app/pages/UsersPermissions.tsx`, `src/app/pages/PaymentSettings.tsx`, `src/app/pages/BulkUploadSummary.tsx`
- Validation: `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

### Build Next — Bulk Upload template, drop-off, and payment options (2026-05-29)

Follow-up to the Bulk Upload flow (did not rebuild the page).

**Template field source & generated template**
- Fields taken from the official `GoGo_Xpress_Template (9).xlsx` (sheet `GGX_Template_v1`), 17 columns: Recipient Name, Contact Number (Recipient), Street Address (Recipient), Province/City-Municipality/Barangay (Recipient), Landmarks/Floor/Unit, Item Name, Receptacle Size, Collectible Amount, Collect Item Value (COD)?, Declared Value, Insure full item value?, Item Protection Fee, Recipient Pays Fees, Promo Code, Reference ID (Optional).
- New `src/app/data/bulkTemplate.ts` exports the columns, 2 sample rows (mirroring the XLS), and `downloadBulkTemplate()`.
- **Limitation:** no spreadsheet library exists and none was added, so the generated template is a **CSV** (Excel-compatible, UTF-8 BOM) named `GoGo_Xpress_Bulk_Upload_Template.csv` — a documented fallback for the .xlsx original. The page header button and an inline "Download Template" both trigger it.

**Removed Template and Resources card**
- The right-column "Template & Resources" card was removed. The primary template download now lives in the page header plus a compact inline "Need the template?" block in the Upload card (with required-columns summary).

**Location Reference decision**
- Removed. The XLS `LocationReference` sheet is just a manual province/city/barangay lookup (~42k rows). The app already provides validated GGX-supported location selection via the live pickup API in the Address Book, and recipient locations are template columns. Replaced the download with inline guidance noting locations must match the GGX-supported options shown in the Address Book.

**Drop-off behavior**
- Selecting Drop-off now shows a "Check drop-off locations nearby" action; opening it shows a DS `Dialog` listing locations (name, address, contact, operating hours).
- **Blocker:** the help-center drop-off page returned HTTP 403 to automated fetch, so `src/app/data/dropoffLocations.ts` is a small local mock matching the expected structure. No geolocation; "nearby" is a static list.

**Payment options**
- New `src/app/components/BulkPaymentOptions.tsx`. Mock corporate account is "via billing": "Pay via billing" is the default/primary option with invoice copy ("you'll receive an invoice after the service"), and a collapsible "Pay with another method instead" reveals the standard options.
- Standard options: Cash (Pay upon pick-up / Deduct from order total), E-wallets (GCash available; Maya/GrabPay/coins.ph "Coming soon", disabled), Credit or Debit card (frontend-only mock fields), Online banking (bank select dropdown). For non-billing accounts the standard options render directly. No real payment processing/tokenization/API.

**Files changed**
- Added: `src/app/data/bulkTemplate.ts`, `src/app/data/dropoffLocations.ts`, `src/app/components/BulkPaymentOptions.tsx`
- Modified: `src/app/pages/BulkUploader.tsx`

**Assumptions / deferred**
- "Via billing" is mocked as always true for the corporate account (no contract data in SubAccountContext). Deferred: drive it from real account contract data.
- CSV template instead of XLSX (no library). Deferred: true .xlsx generation if a library is later approved.
- Drop-off locations are mock pending an accessible data source. Payment/drop-off selections are local state, not persisted to the upload batch.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning.

### Build Next — PaymentMethodTabs component + Bulk Upload integration (2026-05-29)

**PaymentMethodTabs component (`src/app/components/PaymentMethodTabs.tsx`)**
- Reusable, DS-styled payment selector. Core is a single bordered card with a top tab row for the four normal methods:
  - Cash — selectable cards: "Pay upon pick-up" and "Deduct from order total", each with helper text.
  - E-wallets — GCash (Available); Maya/GrabPay/coins.ph disabled with "Coming soon" badges.
  - Credit or Debit card — frontend-only mock fields (cardholder name, card number, expiration, CVV) + Visa/Mastercard badge labels.
  - Online banking — bank `Select` with "Select preferred bank" placeholder (mock bank list).
- Active tab uses a blue underline + blue text; inactive tabs are muted. No real validation/tokenization/payment API.

**Billing-contract behavior**
- `billingAvailable` prop. When true, "Pay via billing" is shown as the primary/default selected option with copy "You'll receive an invoice after the service.", followed by an "Other payment options" section containing the normal tab card (visually secondary/muted until chosen; selectable). When false, only the normal tabs render — no billing option.

**Bulk Upload integration**
- Replaced the previous `BulkPaymentOptions` with `PaymentMethodTabs` in the Bulk Upload payment card and **deleted** `BulkPaymentOptions.tsx` (low-risk; it was only used here — consolidation done now rather than deferred).
- Added a "Bill to account" `Select` driven by new mock `src/app/data/paymentAccounts.ts`. The chosen account's `contractType` drives `billingAvailable`; `key={billToId}` resets payment state when switching accounts.

**Demo billing subaccount**
- `PAYMENT_ACCOUNTS`: **Acme Luzon** = `contractType: 'billing'` (default selected → demonstrates the billing state); **Acme Corporation** = `standard` (demonstrates the normal tabs).

**Files changed**
- Added: `src/app/components/PaymentMethodTabs.tsx`, `src/app/data/paymentAccounts.ts`
- Modified: `src/app/pages/BulkUploader.tsx`
- Deleted: `src/app/components/BulkPaymentOptions.tsx`

**Assumptions / deferred**
- "Bill to account" is a local mock list, not yet sourced from SubAccountContext contract data. Switching away from billing is allowed (friendlier than fully disabling) since the app has no hard billing-lock model.
- Payment selections are local/mock and not persisted to the upload batch. No backend billing/invoicing.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Only the pre-existing recharts bundle-size warning.

### Follow-up — PaymentMethodTabs cleanup & refinement (2026-05-29)

- **Removed "Bill to account" selector.** Billing availability is now derived from the active account/subaccount contract via `isBillingAccount(getCurrentAccountName())` (SubAccountContext), not a separate dropdown. New helpers in `data/paymentAccounts.ts` (`getContractType`, `isBillingAccount`); contract lookup keyed by account name (Main Account/Acme Corporation/Acme Luzon = billing; Acme Visayas = standard).
- **Billing vs non-billing:** billing accounts show "Pay via billing" (default-selected) + "You'll receive an invoice after the service." Non-billing accounts render the normal tabs directly with no billing option.
- **Explicit "Other payment options":** now a selectable radio card. The normal tab card stays disabled until the user explicitly selects it.
- **Disabled interaction fix (functional, not just visual):** when not selected, the tab card gets `pointer-events-none opacity-60 select-none` AND every interactive element (tab buttons, cash option buttons, wallet buttons, card inputs, bank select) receives the `disabled` attribute with guarded handlers — blocks tab switching, option selection, card entry, and bank selection. Disabled wallets (Maya/GrabPay/coins.ph) are also `disabled` + `cursor-not-allowed`, no longer clickable.
- **Responsive layout:** Cash options use `grid-cols-1 sm:grid-cols-2` (side by side when space allows). E-wallets use `grid-cols-2 sm:grid-cols-4` (GCash/Maya/GrabPay/coins.ph side by side, wrap on small screens). More compact, less vertical height.
- **Icon/logo support:** tab icons via Tabler (Cash/Wallet/Card/Bank). Added a `BrandLogo` component with a `BRAND_LOGOS` slot map (GCash, Maya, GrabPay, coins.ph, Visa, Mastercard) — colored initial-box fallback now, swap in real assets by setting `src` per brand later. No external packages added.
- **Tab/card corner fix:** tab row now uses `rounded-t-lg overflow-hidden` and the active tab uses a plain `border-b-2` (removed the `-mb-px` hack) so active styling no longer overflows/clips the rounded top corners.

**Files changed**
- Modified: `src/app/components/PaymentMethodTabs.tsx` (rewritten), `src/app/data/paymentAccounts.ts` (contract lookup), `src/app/pages/BulkUploader.tsx` (removed selector, derive billing from active account)

**Assumptions / deferred**
- Contract data is a mock name-keyed lookup; non-billing state is shown when a standard-contract subaccount (e.g. Acme Visayas) is the active account. Deferred: real contract data from backend.
- Brand logos are fallback boxes until real image assets are provided (slot map ready).

**Validation**
- `npm run build` passes — 0 TypeScript errors (pre-existing recharts bundle-size warning only).

---

### Build Next — Bulk Upload realistic flow: mapping, processing, review, booking (2026-05-29)

Replaced the simple upload → summary flow with a full demo-ready flow covering header detection, column mapping, fast/background processing, editable error rows, and booking completion.

**File upload + header check**
- After file selection, `isGgxTemplate(fileName)` checks if the file looks like the GGX template (name contains "template", "ggx", "gogo", or ends in `.csv`).
- Template files skip column mapping and go directly to processing.
- Non-template files (`.xlsx` with a custom name) show the column mapping step first.
- URL import always skips mapping (treated as a direct feed).

**Column mapping step (`BulkColumnMapper.tsx`)**
- Full-page step rendered within the app shell (not a modal), replacing the BulkUploader form content.
- Three-column table: GGX field name (with required asterisks) | file header dropdown | sample data from file (3 rows, scrollable).
- Auto-maps obvious exact/substring matches on mount; leaves ambiguous fields as "Select column".
- Confirm Fields and Upload button is disabled until all 6 required fields are mapped (Recipient Name, Mobile Number, Street Address, Province, City/Municipality, Barangay).
- Download Template button in header. Back button returns to the upload form.
- Mock file headers and sample data (mirrors the column-mapping screenshot reference) are provided by BulkUploader for non-template files.

**Fast vs background processing decision**
- `uploadMode === 'standard'` → fast processing flow.
- `uploadMode === 'same-day'` → background processing flow.
- This gives clear demo control: use Standard to see the fast spinner; use Same-Day to see the background flow.

**Fast processing**
- Shows a spinner Dialog modal: "UPLOADING ORDERS / Please wait while we upload your orders…"
- CSS `animate-spin` + `border-t-emerald-500` ring approximates the teal spinner from the reference screenshots.
- Auto-navigates to the review/summary page after 2.5 seconds via `useEffect` + `setTimeout`.
- Dialog has no close button (non-dismissable during processing).

**Background processing**
- Shows a "PROCESSING UPLOAD" Dialog modal with a stacked-pages illustration (built from Tailwind divs + Tabler `IconArrowUp`) and the message "Your orders are being processed…".
- "Okay, got it!" button dismisses the modal and returns the user to the Bulk Upload page.
- The upload is added to the module-level store (`bulkUploads.ts`) immediately as `status: 'processing'`.
- A `setTimeout` of 8 seconds simulates background completion: status updates to `needs-review` and a notification event is pushed to `PENDING_NOTIFICATIONS`.
- Recent Uploads re-renders via `sessionTick` state increment on completion.
- Processing rows show a "Processing in background…" label and are non-clickable until done.

**Module-level upload store (`src/app/data/bulkUploads.ts`)**
- `SESSION_UPLOADS[]` — mutable array, lives for the tab lifetime.
- `addUpload(record)` / `updateUploadStatus(id, status)` — called by BulkUploader.
- `getSessionUploads()` — called by BulkUploader (Recent Uploads table) and BulkUploadSummary (batch metadata).
- `PENDING_NOTIFICATIONS[]` — notification event queue ready for bell integration.
- TODO: next prompt should import `PENDING_NOTIFICATIONS` in `RootLayout.tsx` and render items in the bell popover (batchId, fileName, validRows/errorRows counts, link to review page). Event shape is final; no structural changes needed to this file.

**Recent Uploads table**
- Session uploads (newest first) are merged with the static seed list, deduplicating by ID.
- Rows with `status: 'processing'` are rendered with `opacity-70` and are non-clickable.

**Review page rebuild (`BulkUploadSummary.tsx`)**
- Header: "Review Upload Details" with date uploaded and Batch ID from the session store (falls back to static defaults for seed uploads).
- **Valid orders card**: green check icon, "{N} orders uploaded successfully", compact 5-row table (Recipient, Item Name, Item Price, Fees paid by, Fees), "View all N in transactions page" link.
- **Error rows card** (shown when errors exist): red border card, error count + "Download Failed Orders" button, horizontally scrollable editable table, info banner with Retry Upload action.
- **Duplicate rows**: deferred — a TODO comment marks where the section will go once server-side reference-ID deduplication is available.

**Editable error rows**
- Columns: Row # | Error list | Recipient Name * | Mobile Number * | Street Address * | Province * | City/Municipality *.
- Invalid fields get `border-red-500 bg-red-50 focus:ring-red-500`; helper text appears below.
- `rowEdits` state tracks inline changes separately from original `errorRows` so original error context is preserved.
- Province is a Select (mock PH province list); City/Municipality and other fields are plain `<input>` elements (not the DS Select/Input — DS Input/Select don't accept className overrides for error state easily; raw inputs with matching classes used for the compact table row context).
- Row-level errors include: field-required, invalid pouch size, COD exceeds limit, possible duplicate.
- Field-level errors: mobileNumber, recipientName, streetAddress only (others are structural).

**Retry Upload / revalidation**
- `handleRetryUpload()`: re-validates each error row against `rowEdits`. Required-field errors are cleared if the field is now filled. Structural errors (pouch size, COD, duplicates) remain.
- Fully resolved rows are moved to the valid count (`fixedCount` increments).
- A green confirmation note appears in the valid orders card after fixing rows.
- Frontend/mock only — no real server validation.

**Bottom booking section**
- Three-column grid: Pick-up options | Payment | Summary.
- Pick-up options: Pick-up / Drop-off toggle; Pick-up Date input with formatted label and "Change pick-up date" link; drop-off shows "Check drop-off locations" dialog (reuses DROPOFF_LOCATIONS).
- Payment: `PaymentMethodTabs` component (billing/non-billing behavior preserved, key= reset on account change).
- Summary: Number of orders (updates when rows are fixed), mock fee breakdown (Shipping ₱1,200, Item Protection ₱0, Fuel Surcharge ₱500, Total ₱1,700), collection note based on billing vs cash vs pickup vs dropoff.
- Complete Booking CTA disabled when totalValidCount === 0.

**Booking/payment success**
- Shows a Dialog modal: "YOUR BOOKING IS COMPLETE", green check, order count, pickup date, total fees note, three actions: Upload Another Batch, Go to Batch Details (closes modal), Go to Home.
- "Go to Batch Details" closes the success modal and returns to the review page.
- Payment note is conditional: billing → "To be invoiced after service"; cash pickup → "To be paid on pick-up"; drop-off → "To be paid at drop-off".
- Frontend/mock only — no real payment processing.

**Files changed**
- Added: `src/app/data/bulkUploads.ts` (module store + notification TODO structure)
- Added: `src/app/components/BulkColumnMapper.tsx` (column mapping step)
- Modified: `src/app/pages/BulkUploader.tsx` (step machine, fast/background processing, session uploads merge)
- Modified: `src/app/pages/BulkUploadSummary.tsx` (full rebuild: valid table, editable error rows, booking section, success modal)

**Frontend/mock limitations**
- No real file parsing — header detection is name-based. Sample data in the mapper is always the same mock dataset regardless of actual file content.
- Processing times are mocked (fast: 2.5s; background: 8s).
- Fee breakdown is a static mock; real fees would come from an API.
- Background upload state is in-memory (module-level); reloading the page resets it.
- Retry revalidation only checks required-field presence; structural errors (pouch size, COD, duplicates) are never cleared inline.
- Duplicate rows section is deferred (TODO comment left in place).
- Payment method selection within PaymentMethodTabs is not read back by BulkUploadSummary; the fee note is based on billing/non-billing + firstMile only.

**Deferred**
- Duplicate reference ID section in the review page.
- Notification bell integration (PENDING_NOTIFICATIONS ready; wire into RootLayout in next prompt).
- Real file parsing / server-side validation.
- Carrying pickup/payment selections from BulkUploader into BulkUploadSummary via store (currently summary manages its own).
- Per-row inline editing of pouch size, COD, and other structural error fields.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is pre-existing recharts issue (924 kB, same root cause).

---

### QA / Stabilization — Bulk Upload flow (2026-05-29)

Focused QA pass on the newly built Bulk Upload flow. No new features added.

**Issues fixed:**

1. **Error rows table — missing columns (primary known issue)**
   - `ErrorRowData` interface extended with all template-relevant fields: `landmarks`, `itemName`, `pouchSize`, `cod`, `codAmount`, `itemProtection`, `recipientPaysFees`, `referenceId`.
   - `EditableField` type extended: `barangay` (was in interface but absent from table), `landmarks`, `itemName`, `pouchSize`, `codAmount`, `referenceId`.
   - `INITIAL_ERROR_ROWS` updated with full mock values for all rows (row 4 uses `pouchSize: 'SUPERSIZED'` and `codAmount: '75000'` to demonstrate both structural error types).
   - `rowToEdits` updated to include all editable fields.
   - Table now has 16 columns: Row | Error | Recipient Name * | Mobile Number * | Street Address * | Province * | City/Municipality * | Barangay * | Landmarks/Unit # | Item Name | Pouch/box size | COD? | COD Amount | Item Protection | Recipient Pays | Reference ID.
   - `min-w` set to `1800px` so all columns render at readable widths; scroll is contained to the error card's `overflow-x-auto` wrapper (not the page).
   - `COD?`, `Item Protection`, and `Recipient Pays Fees` are display-only (values shown as text).
   - `Pouch/box size` uses a Select with `RECEPTACLE_SIZES` values imported from `bulkTemplate.ts`; shows red border when invalid or empty.
   - `COD Amount` shows red border and "Exceeds ₱50,000 limit" helper when value exceeds the limit.
   - Extracted a small `ErrInput` helper component to remove repetition in the table row render.

2. **`validateEdits` improved — fixable structural errors now clearable**
   - "Invalid pouch size" clears on retry if user selects a valid size from `RECEPTACLE_SIZES`.
   - "COD must not exceed ₱50,000.00" clears on retry if user enters a value ≤ 50,000.
   - "Possible duplicate" errors remain unfixable inline (correct — requires source file change).

3. **`fieldHasError` extended** — now highlights `pouchSize` and `codAmount` cells red when their respective errors are active.

4. **Dead early-return success block removed** — The `if (showSuccess) { return (...) }` block was redundant with the bottom `<Dialog open={showSuccess}>`. Removed; the Dialog at the bottom is the single success UI. "Go to Batch Details" correctly closes the modal and shows the review page; "Upload Another Batch" navigates away.

5. **"Upload Another Batch" icon fixed** — Changed from `IconArrowLeft` (semantically wrong back arrow) to `IconUpload` in the booking success dialog.

6. **Unused `Badge` import removed** from `BulkUploadSummary.tsx`.

**Notification store confirmed intact** — `PENDING_NOTIFICATIONS` in `src/app/data/bulkUploads.ts` is exported and populated by `updateUploadStatus`. TODO comment and event shape unchanged; ready for bell integration in the next prompt.

**Files changed**
- Modified: `src/app/pages/BulkUploadSummary.tsx` (all fixes above)

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is pre-existing recharts issue (927 kB, +3 kB from RECEPTACLE_SIZES import — negligible).

---

### Fix — Bulk Upload review pre-ship issues (2026-05-29)

Five targeted fixes to the Bulk Upload review/summary flow before notification bell integration.

**1. Error table input/select visual consistency**
- `ErrInput` helper component: changed `rounded` (4px) → `rounded-lg` (10px) to match the GGX Corporate DS radius and the DS `Select` component's own `rounded-lg` base class.
- All inline inputs in the error table now use consistent `rounded-lg border` styling, matching the DS Input/Select components.

**2. Address fields — location API cascade**
- New `LocationCascadeEditor` component defined at the top of `BulkUploadSummary.tsx` (local, not exported — used only in the review table).
- Uses `getAllProvinces()`, `getAllCities()`, `getAllDistricts()` from `locationApi.ts` — three new delivery-address variants that fetch without `?pickup=quad-x` so all GGX-served locations are available (not just pickup-supported ones).
- Cascade behaviour: province → city → barangay in stacked selects. Child selects are disabled until parent is selected. Selecting a new province resets city and barangay. Selecting a new city resets barangay.
- Initial value pre-population: on mount, provinces fetch and the matching province is found by name → provinceId is set → cities fetch and the matching city is found by name → cityId is set → barangays fetch. The barangay select auto-selects by name since the name is the select value.
- API error fallback (CORS or network): component replaces the three selects with plain text inputs and shows "Location API unavailable — enter manually." This handles both CORS-blocked and offline scenarios without crashing.
- Province/City/Barangay columns merged into a single "Location *" column containing the cascade editor. This keeps the table more scannable and avoids managing three related pieces of state in separate narrow cells.
- `updateLocation(rowNum, province, city, barangay)` handler updates all three fields in `rowEdits` atomically.
- New functions added to `src/app/lib/locationApi.ts`: `getAllProvinces()`, `getAllCities(provinceId)`, `getAllDistricts(cityId)`. Internal `doFetch(url)` helper extracted to avoid duplication between pickup-filtered and delivery variants.

**3. Item Protection column replaced**
- Removed `itemProtection: string` display-only field from `ErrorRowData`.
- Added `insureFull: string` ('Yes' | 'No' | '') — editable select with options "Yes — full COD covered" and "No — free ₱500 only".
- Added computed "Item Protection Fee" display column (not editable):
  - Formula: if insureFull = Yes and COD Amount > 500 → fee = (COD Amount − 500) × 0.01
  - Example: COD 1000 → (1000 − 500) × 0.01 = ₱5.00
  - If COD ≤ 500 or insureFull ≠ Yes → ₱0.00 (free coverage applies)
  - Shown as `₱{fee}` with "Free ₱500 coverage" helper text when not insured.
- `computeItemProtectionFee(edits)` helper function encapsulates the formula.
- Bottom fee summary: `totalItemProtectionFee` is now computed live from `errorRows` via `computeItemProtectionFee`. `totalFees` updates accordingly. This makes the fee summary reflect actual insure-full selections in error rows.
- `insureFull` added to `EditableField` type and `rowToEdits`.

**4. Duplicate row removal**
- Added an "Actions" column (last column) to the error table.
- For rows whose `errors` array includes "duplicate" or "Possible", a trash icon button is shown: `IconTrash`, tooltip "Remove duplicate row", `aria-label="Remove duplicate row {N}"`.
- `handleRemoveRow(rowNum)`: removes the row from `errorRows`, cleans up its entry from `rowEdits`. The removed row is discarded (not counted as fixed — it does not increment `fixedCount` or appear in the batch).
- Info banner updated to mention the trash icon for duplicates alongside Retry Upload.
- No confirmation dialog — removal is immediate (frontend/mock context, consistent with the existing inline-edit UX).

**5. Booking success payment method copy**
- `SelectedPaymentMethod` type exported from `PaymentMethodTabs.tsx`: `billing`, `cash (pickup | deduct)`, `ewallet (wallet name)`, `card`, `banking (bank name)`.
- `onPaymentMethodChange?: (method: SelectedPaymentMethod) => void` prop added to `PaymentMethodTabsProps`.
- `NormalPaymentCard` gains `onChange?: (method: SelectedPaymentMethod) => void` prop. Each setter (tab change, cash option, wallet, bank) calls `onChange` with the new selection.
- `PaymentMethodTabs` wires callbacks: billing button → emits `{ type: 'billing' }`; "Other payment options" button → emits the last NormalPaymentCard selection (tracked via `normalMethodRef`); NormalPaymentCard `onChange` → passes through to `onPaymentMethodChange`.
- `BulkUploadSummary` tracks `selectedPayment: SelectedPaymentMethod | null` state.
- `paymentCopy(method, billingAvailable)` helper produces human-readable copy for each method: billing → "To be invoiced after service"; cash/pickup → "To be paid on pick-up"; cash/deduct → "Deducted from COD collections"; ewallet → "Prepaid via [wallet]"; card → "Prepaid via card"; banking → "Prepaid via [bank]".
- Success dialog: "Total fees — [paymentCopy]:" reflects actual selected method.
- Bottom fee summary: also shows `paymentCopy` as the collection note below the total.
- Fallback: if `selectedPayment` is null (user never interacted with payment section), defaults to billing/invoice copy for billing accounts and cash/pickup for non-billing — consistent with the component's initial state.

**Files changed**
- Modified: `src/app/lib/locationApi.ts` (`doFetch` helper, `fetchLocationsAll`, `getAllProvinces`, `getAllCities`, `getAllDistricts`)
- Modified: `src/app/components/PaymentMethodTabs.tsx` (`SelectedPaymentMethod` export, `onPaymentMethodChange` prop, `NormalPaymentCard.onChange`, per-setter emissions)
- Modified: `src/app/pages/BulkUploadSummary.tsx` (all five fixes, `LocationCascadeEditor` component, `computeItemProtectionFee`, `paymentCopy`, `handleRemoveRow`)

**Assumptions / deferred**
- Location cascade uses delivery-endpoint (no pickup filter) as specified. CORS behaviour against `api.gogox.ph` from the browser is untested; the API error fallback (plain text inputs) handles the blocked-CORS case gracefully.
- Delivery API (no pickup filter) returns all GGX-served locations including areas that may not support pickup. This is correct for recipient addresses.
- `totalItemProtectionFee` is computed from error rows only (the 100 mock valid orders contribute ₱0 since they're static). Real fee aggregation would come from the backend.
- Duplicate rows 5 and 6 remain in the error table after row 4's structural errors are fixed; they must be removed via the trash icon separately. Cross-row "no longer a duplicate after source row fixed" logic is deferred.
- No confirmation dialog on row removal (consistent with inline-edit UX; row count is visible before confirming booking).
- `SelectedPaymentMethod` is not persisted — reloading the page resets the selection.

**Validation**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is pre-existing recharts issue (932 kB, +5 kB from LocationCascadeEditor and API functions — negligible).

---

### Fix — Bulk Upload error-row review usability + validation (2026-05-29)

Nine targeted fixes to the error-rows review group, building on the prior pass.

**1. Restored Province / City / Barangay as separate columns**
- The merged single "Location" column was reverted to three distinct columns with their original headers: Province *, City/Municipality *, Barangay *.
- `LocationCascadeEditor` (single stacked cell) replaced with `LocationCascadeCells` — a component that returns a fragment of three `<td>` cells, one per location level. Each error row renders one instance (own cascade state/effects).
- Cascade rules preserved: city disabled until province chosen, barangay disabled until city chosen, children reset when a parent changes. Still uses the delivery-address API variants (`getAllProvinces/Cities/Districts`, no pickup filter). CORS/network fallback renders three plain text inputs.

**2. Input/select readability**
- Increased column `min-w` values across the table (e.g. Street Address 200px, Province 175px, City 190px, Barangay 175px, Item Name 185px) and bumped the table `min-w` to 2700px so values are not clipped.
- Native `<select>` elements render the browser arrow (no `appearance-none`), so option text is fully readable.
- Horizontal scroll remains scoped to the error card (`overflow-x-auto`); the page itself does not scroll.

**3. Input/select border radius**
- Editable table fields now use `rounded-md` (was `rounded-lg`), applied consistently via shared `TABLE_INPUT_BASE` / `TABLE_SELECT_CLS` constants and the `YesNoToggle`. Pouch size converted from the DS `Select` (rounded-lg) to a native select using `TABLE_SELECT_CLS` for radius consistency. Red/invalid states preserved.

**4. Yes/No fields**
- New `YesNoToggle` segmented control (Yes | No) used consistently for COD?, Recipient Pays Fees, and Insure full item value?. Supports an unset state ('') so required fields show a red border until answered.
- COD? and Recipient Pays Fees are now editable (previously display-only text). "Recipient Pays" header renamed to "Recipient Pays Fees".
- `cod` and `recipientPaysFees` added to `EditableField`, `RowEdits`, and `rowToEdits`.

**5. Insure full item value error naming + fixability**
- Error text changed from '"Item protection" field is required' to '"Insure full item value?" field is required'.
- The error is now fixable: selecting Yes or No on the toggle clears it. `validateEdits` and `fieldHasError` updated to key off the new message and the `insureFull` value. After fixing and clicking Retry Upload (or once all errors resolve), the row moves to the valid group.

**6. Item protection columns**
- "Insure full item value?" stays editable (now a Yes/No toggle); "Item Protection Fee" stays a non-editable calculated display.
- `computeItemProtectionFee`: Yes & COD > 500 → (COD − 500) × 0.01; otherwise ₱0. Recalculates live whenever COD Amount or Insure full item value? changes (computed in render from edits). Bottom fee summary aggregates the per-row fees.

**7. Duplicate row handling — dynamic + auto-revalidate**
- Mock data adjusted: rows 5 & 6 are duplicates of each other (shared Reference ID REF-005), otherwise valid. Row 4 keeps its own structural errors (REF-004, unique).
- Duplicate detection is now dynamic by Reference ID inside `validateEdits`: a row is flagged only while another row in the current set shares its Reference ID.
- Actions column retains the trash button (`aria-label="Remove duplicate row {N}"`, tooltip "Remove duplicate row").
- `handleRemoveRow` now removes the row AND immediately revalidates the remaining rows (shared `revalidateAll` helper). Removing one duplicate makes the survivor's Reference ID unique, so it auto-moves to the valid group (increments `fixedCount`). No separate Retry click needed.

**8. Error group empty state**
- When `errorRows` becomes empty (all fixed or removed) and the batch originally had errors (`HAD_ERRORS`), a positive green empty-state card shows instead of a blank area: title "No rows with errors", body "All affected rows have been fixed or removed. You can proceed with the valid orders below."

**9. Booking success payment method (confirmed + reinforced)**
- The previous `selectedPayment` + `paymentCopy` wiring remains; success and summary copy reflect the actual selected method (billing → invoice copy; cash/pickup → pay-on-pickup; cash/deduct → deducted from COD; prepaid → "Payment completed — prepaid via {method}"). No longer defaults to billing. Prepaid wording strengthened to read as completed.

**Validation behavior**
- `revalidateAll` re-runs full validation after any retry or duplicate removal, covering location, COD?, Recipient Pays Fees, Insure full item value?, COD Amount edits, and duplicate removal. Booking CTA uses live `totalValidCount`; fee summary includes computed item protection fees.

**Files changed**
- Modified: `src/app/pages/BulkUploadSummary.tsx` (all nine fixes; `YesNoToggle`, `LocationCascadeCells`, `revalidateAll`, dynamic duplicate detection, empty state)

**Assumptions / deferred**
- Duplicate detection only spans the error-row set (not the 100 mock valid orders). Real cross-batch dedup is backend work.
- COD Amount over-limit check still evaluates even when COD? is toggled to No (minor; acceptable for mock).
- Location cascade still depends on `api.gogox.ph` reachability; the text-input fallback covers CORS/offline.
- Payment selection and edits are in-memory; reload resets them.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (934 kB).

---

### Build Next — Corporate Notifications model + bell integration (2026-05-29)

Built a categorized corporate notification experience and wired completed Bulk Upload background events into the bell.

**Notification model (`src/app/data/notifications.ts`, new)**
- `NotificationCategory`: `bulk_upload` | `transaction` | `account` | `service_advisory` | `report` | `support`.
- `AppNotification`: `id`, `category`, `title`, `body`, `timestamp` (ISO), `read`, optional `href`, optional `meta` (`batchId` / `trackingNumber` / `ticketId` / `reportId`).
- `CATEGORY_META`: per-category label + Tabler icon + subtle icon/bg color classes (Bulk Upload=blue/IconUpload, Transaction=indigo/IconPackage, Account=violet/IconUserCog, Service=amber/IconAlertTriangle, Report=emerald/IconFileText, Support=gray/IconMessage). Icons are subtle and functional, not card-heavy.
- Helpers: `getAllNotifications()` (live upload events + mock seed, newest first), `getUnreadCount()`, `markAllNotificationsRead()`, `relativeTime(iso)`.

**Bulk Upload integration**
- `PENDING_NOTIFICATIONS` from `bulkUploads.ts` is mapped via `uploadEventToNotification()` into `category: 'bulk_upload'` items.
- Copy is batch-specific: title "Bulk upload is ready for review" (or "Bulk upload completed successfully" when `errorRows === 0`); body "{fileName} finished processing. {validRows} valid orders, {errorRows} rows need review." Each links to `/dashboard/bulk-uploader/summary/{batchId}`.
- A completed background upload is presented as a batch-level notification (Bulk Upload category), distinct from order-level Transaction notifications.

**Mock corporate content** (seeded, mutable for session read-state)
- Transaction: "Delivery exception reported" (links to a transaction), "Pickup scheduled".
- Account: "New manager access added" (→ Users & Permissions), "Billing contract updated" (→ Billing).
- Service Advisory: "Pickup cutoff advisory", "Temporary service delay in selected areas" (informational, no link).
- Report: "Monthly billing report is ready" (→ Billing, `meta.reportId`).
- Support: "Support ticket update" (→ Support Tickets, `meta.ticketId`) — mock only, future Zendesk-ready (no integration).

**Bell popover (`RootLayout.tsx`)**
- Replaced the hardcoded 2-item popover with a model-driven list (w-96, compact, scrollable, `max-h-96`).
- Each row: category icon in a tinted square + small uppercase category label + title + body + relative time. Unread rows get a subtle blue tint, a blue dot, and bolder title (visual priority).
- Items with `href` are clickable buttons that navigate + close; informational items (no `href`) render as disabled buttons (subdued, non-navigating) — no dead-end clicks.
- "View all notifications" footer links to the new `/dashboard/notifications` page.
- Empty state: "No new notifications" / "Important account, upload, and delivery updates will appear here."

**Unread / read behavior**
- Red dot replaced with a small count badge driven by `getUnreadCount()` (live); shows "9+" past 9.
- Opening the popover snapshots the current list (shallow copies, so unread emphasis persists while viewing) then calls `markAllNotificationsRead()`, clearing the badge. Closing/reopening shows all as read.
- The Notifications page also marks all read on mount.

**Notifications page (`src/app/pages/Notifications.tsx`, new)**
- Low-risk full page reachable via "View all notifications" and route `/dashboard/notifications` (added to `routes.tsx`). Groups notifications by category using DS Cards; clickable rows navigate, informational rows are subdued. Not added to the sidebar nav (kept scope tight; reachable from the bell).

**Files changed**
- Added: `src/app/data/notifications.ts`, `src/app/pages/Notifications.tsx`
- Modified: `src/app/layouts/RootLayout.tsx` (bell + popover), `src/app/routes.tsx` (route), `src/app/data/bulkUploads.ts` (TODO comment updated — integration done)

**Assumptions / deferred**
- Notifications are in-memory (module-level); read-state and live upload events reset on full page reload. No backend notification API.
- Zendesk / Support Ticket integration NOT implemented — `support` category is mock-only and future-ready (no model refactor needed to connect later).
- Reports category links to Billing for now; a dedicated Reports/Downloads page is deferred.
- Service advisories are informational (no link) by design.
- Notifications page is intentionally minimal (grouped list); richer filtering/pagination deferred.
- Sidebar nav entry for Notifications not added (bell + View all cover access); can be added later if desired.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (942 kB).

---

### Build Next — Reports & Downloads page (2026-05-29)

Added a dedicated Reports/Downloads experience and repointed `report` notifications to it (removing the prior "links to Billing" compromise).

**Reports data (`src/app/data/reports.ts`, new)**
- `ReportItem`: id, name, type (`billing` | `settlement` | `delivery` | `analytics`), period, generatedAt, status (`ready` | `generating` | `failed`), format, sizeLabel.
- `REPORT_TYPE_META` (label + Tabler icon + subtle colors) and `REPORT_STATUS_META` (label + Badge variant).
- `SEED_REPORTS`: 6 mock reports; `RPT-2026-05` matches the bell "Monthly billing report is ready" notification's `meta.reportId` so it lands on a real row.
- `downloadReport(report)`: generates a real CSV (UTF-8 BOM, per-type mock summary rows) and triggers a browser download — same library-free fallback approach as the bulk template. No backend.

**Reports page (`src/app/pages/Reports.tsx`, new)**
- Summary cards (Total / Ready / Generating), a "Generate a Report" card (type Select + button), and an Available Reports table.
- Generate is mock: appends a `generating` row, then flips it to `ready` after 2.5s (local state).
- Per-row action: Download (ready, calls `downloadReport`), "Generating…" pulse (generating), Retry (failed). Type icon + status Badge per row. Empty state included.

**Wiring**
- Route `/dashboard/reports` added to `routes.tsx`.
- `report` notification href repointed from `/dashboard/billing` to `/dashboard/reports`.
- "Reports" sidebar nav item added to all three nav variants (standard / main / subaccount), after Analytics, using `IconFileText`.

**Files changed**
- Added: `src/app/data/reports.ts`, `src/app/pages/Reports.tsx`
- Modified: `src/app/routes.tsx` (route), `src/app/data/notifications.ts` (report href), `src/app/layouts/RootLayout.tsx` (nav item + icon import)

**Assumptions / deferred**
- Reports are in-memory mock; generated reports reset on reload. No backend reporting service.
- Downloads are CSV (no XLSX/PDF library); real exports would come from a backend.
- "Retry" on failed reports is a stub (no failed seed currently). Date-range pickers / filtering deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (949 kB).

---

### Build Next — Support notifications wired to Submit Ticket flow + Zendesk boundary (2026-05-29)

Made the `support` notification category functional and added a single stubbed Zendesk integration point.

**Notification model — runtime push (`notifications.ts`)**
- Added `RUNTIME_NOTIFICATIONS` (session-pushed) and `pushNotification(input)` so other modules can add notifications without importing the mock array. This is the extension point for future sources (Zendesk, advisories, etc.).
- `getAllNotifications`, `getUnreadCount`, and `markAllNotificationsRead` now include runtime notifications.
- The seeded support notification href now deep-links: `/dashboard/support-tickets?ticket=TCK-1043`.

**Support tickets data (`src/app/data/supportTickets.ts`, new)**
- `SupportTicket` model + module-level `SUPPORT_TICKETS` seed (moved off the page; includes `TCK-1043` so the bell notification deep-links to a real row).
- `getTickets()`, `getTicket(id)`.
- `submitTicket(input)`: generates an id, prepends the ticket, pushes a `support` notification ("Support ticket submitted" → `?ticket={id}`), and calls the Zendesk boundary.
- **Zendesk integration boundary**: `syncTicketToZendesk(ticket)` — the single stubbed integration point (returns a mock external ref, `TODO(zendesk)`). When Zendesk is scoped, only this function changes; the UI and data flow stay intact.

**Support Tickets page (`SupportTickets.tsx`)**
- Consumes `getTickets()` / `submitTicket()` from the data module (no more inline ticket array).
- Submit form is now controlled and functional: requires Issue Type, creates a ticket, refreshes the list, closes the form, and highlights the new ticket.
- Deep-link handling via `useSearchParams`: `?new=1` auto-opens the submit form; `?ticket=ID` shows a dismissible "Showing ticket … from your notification" banner, highlights the row (`bg-blue-50`), and scrolls it into view.
- "View" row action navigates to `?ticket=ID` (no longer a dead stub).
- Status filter now actually filters; footer count is dynamic.

**Files changed**
- Added: `src/app/data/supportTickets.ts`
- Modified: `src/app/data/notifications.ts` (runtime push + support href), `src/app/pages/SupportTickets.tsx` (data module + deep-links + functional submit)

**Assumptions / deferred**
- Zendesk NOT integrated — `syncTicketToZendesk` is a documented stub; submit + notifications are frontend/mock only.
- Tickets are in-memory (module-level); submitted tickets reset on full reload.
- Bell badge reflects a newly pushed support notification on the next RootLayout render (no global event bus — acceptable for mock).
- No ticket detail page; deep-link highlights the row in the list (a full ticket detail view is deferred).

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (953 kB).

---

### Build Next — Support Ticket detail view (2026-05-29)

Added a real ticket detail page with a conversation thread + reply, replacing the prior row-highlight deep-link.

**Conversation thread (`supportTickets.ts`)**
- `TicketMessage` model + per-ticket `TICKET_MESSAGES` store (TCK-1043 seeded with a 3-message thread).
- `getTicketMessages(id)` lazily synthesizes an opening customer message + support acknowledgement for tickets without an explicit thread.
- `addTicketReply(id, body)` appends a customer message, bumps `lastUpdate`, reopens resolved/closed tickets, and calls the Zendesk reply stub.
- `postTicketReplyToZendesk(ticketId, message)` — second stubbed Zendesk boundary (replies), `TODO(zendesk)`.

**Detail page (`src/app/pages/SupportTicketDetail.tsx`, new)**
- Route `/dashboard/support-tickets/:id`.
- Header with issue type, status + priority badges, ticket id.
- Two-column layout: conversation thread (customer right/blue, support left/gray, avatars) with a reply textarea + Send (calls `addTicketReply`, refreshes thread); details sidebar (tracking number, assignee, created, last update).
- Not-found state for unknown ids.

**Deep-link + navigation repointing**
- Seed support notification href → `/dashboard/support-tickets/TCK-1043`.
- `submitTicket` notification href → `/dashboard/support-tickets/{id}`.
- List page: removed the `?ticket=` highlight banner/row-scroll logic (replaced by the detail route). Rows and the "View" action now navigate to the detail page; ticket id rendered as a blue link. `?new=1` (open submit form) retained. After submit, navigates straight to the new ticket's detail page.

**Files changed**
- Added: `src/app/pages/SupportTicketDetail.tsx`
- Modified: `src/app/data/supportTickets.ts` (thread + reply + reply stub), `src/app/data/notifications.ts` (support href), `src/app/routes.tsx` (detail route), `src/app/pages/SupportTickets.tsx` (navigate to detail, removed highlight logic)

**Assumptions / deferred**
- Conversation threads and replies are in-memory (module-level); reset on full reload. No backend.
- Zendesk still not integrated — `syncTicketToZendesk` (create) and `postTicketReplyToZendesk` (reply) are the two documented stubs.
- No attachments, internal notes, or status-change controls on the detail page (deferred).
- Service Advisories remain link-less (next candidate for a dedicated read surface).

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (960 kB).

---

### Build Next — Service Advisories page (2026-05-29)

Gave the last link-less notification category a dedicated read surface. All six notification categories are now actionable.

**Service advisories data (`src/app/data/serviceAdvisories.ts`, new)**
- `ServiceAdvisory` model: id, title, body, severity (`info` | `warning` | `critical`), status (`active` | `scheduled` | `resolved`), affectedAreas[], effectiveFrom/To, postedAt.
- `SEVERITY_META` (icon + colors + Badge variant) and `STATUS_META` (Badge variant).
- Seed: ADV-002 (critical/active — Cebu weather delay), ADV-001 (warning/scheduled — Jun 12 pickup cutoff), ADV-003 (info/resolved — API maintenance). ADV-001/002 mirror the seeded `service_advisory` notifications.

**Service Advisories page (`src/app/pages/ServiceAdvisories.tsx`, new)**
- Route `/dashboard/advisories`. Header shows active count; status filter (All/Active/Scheduled/Resolved).
- Each advisory is a card: severity icon + title + severity & status badges + body + effective date range + affected-area chips + posted time. Resolved items are dimmed. Empty state for filtered-out views.

**Notification wiring**
- Both `service_advisory` seed notifications now link to `/dashboard/advisories` (previously informational/no link).
- This closes the category-coverage gap: bulk_upload → batch summary, transaction → transaction, account → users/billing, service_advisory → advisories, report → reports, support → ticket detail.

**Files changed**
- Added: `src/app/data/serviceAdvisories.ts`, `src/app/pages/ServiceAdvisories.tsx`
- Modified: `src/app/routes.tsx` (route), `src/app/data/notifications.ts` (advisory hrefs)

**Assumptions / deferred**
- Advisories are static mock; no backend/ops feed. No per-advisory detail route (the list card carries full content). No deep-link highlight to a specific advisory (list is short).
- Not added to the sidebar nav (reachable via notifications, consistent with the Notifications page); a nav entry can be added later if desired.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (965 kB).

---

### Build Next — Tabbed Notifications, account-scope visibility, sidebar entry (2026-05-29)

Reworked the Notifications experience: tabbed page, parent/subaccount visibility rules, and a sidebar entry.

**Notification visibility / account-scope model (`notifications.ts`)**
- Added `NotificationScope` (`global` | `parent` | `subaccount`) and `scope` + `accountName` to `AppNotification`.
- `NotificationViewer` ({ role, accountName }). `useNotificationViewer()` derives the viewer from `SubAccountContext`: the demo user (Max) is the **Admin**; scope is `'all'` when subaccounts are disabled / Main-Account view / `currentAccount === 'main'`, otherwise the drilled-into subaccount name.
- `isNotificationVisible(n, viewer)` rules:
  - `global` → everyone.
  - Admin on All-Accounts → everything; Admin in a subaccount → parent-level + that subaccount's items.
  - Manager → global + their subaccount only; never parent-level.
- `getVisibleNotifications`, `getVisibleUnreadCount`, `markVisibleNotificationsRead` operate per-viewer.
- Seed scoping: transactions → subaccount (Acme Corporation / Acme Luzon); account "manager access added" → subaccount (Acme Luzon, relevant to that Manager); billing-contract + monthly report → `parent` (Admin-only, finance at parent level); service advisories → `global`; support ticket → subaccount (Acme Corporation).
- The Manager branch is fully implemented but not actively triggered (no Manager login exists); documented assumption.

**Category-specific visibility (per task)**
- Bulk Upload & Transaction → Admin + owning-subaccount Manager (subaccount scope).
- Account/access → subaccount-scoped only when relevant to a Manager; otherwise parent (Admin-only).
- Billing/report → parent (Admin-only).
- Service advisories → global (location-based).
- Support → subaccount (Admin + owning Manager).

**Tabbed Notifications page (`Notifications.tsx`)**
- Replaced vertically-stacked category sections with tabs: All · Bulk Uploads · Transactions · Account · Service · Reports · Support.
- All tab = mixed visible list, newest-first; category tabs filter to that category. Per-tab unread count badges (snapshot at open, so badges/emphasis reflect unread-at-open while the store is marked read for the bell). Unread rows get blue tint + dot + bolder title. Category icon/label kept on every row. Per-tab empty states.
- Visibility-filtered via `getVisibleNotifications(viewer)`; marks visible read on mount.

**Bulk Upload notifications**
- Still sourced from `PENDING_NOTIFICATIONS`; appear under All + Bulk Uploads. Copy: errors>0 → "Bulk upload is ready for review" / "{file} finished processing. {valid} valid orders, {errors} rows need review."; errors=0 → "Bulk upload completed successfully" / "{file} finished processing with {valid} valid orders." Scope `subaccount` (live events carry no subaccount yet → `accountName` undefined, visible to Admin/All).

**Bell popover**
- Now viewer-scoped: `getVisibleUnreadCount` drives the badge, snapshot uses `getVisibleNotifications`, opening marks visible read. Compact list unchanged otherwise.

**Sidebar discoverability**
- Added a "Notifications" nav item (IconBell) to all three nav variants, before Settings, routing to `/dashboard/notifications`, with a red unread-count badge (`ml-auto`) when visible unread > 0.
- Service Advisories: NOT given a second sidebar item — reachable via the Notifications **Service** tab and the advisory notifications (its `/dashboard/advisories` page remains). Avoids nav clutter; Support deliberately not re-emphasized in nav.

**Files changed**
- Modified: `src/app/data/notifications.ts` (scope model, viewer, visibility helpers), `src/app/data/bulkUploads.ts` (optional `accountName` on event), `src/app/data/supportTickets.ts` (scope on pushed notification), `src/app/pages/Notifications.tsx` (tabbed rewrite), `src/app/layouts/RootLayout.tsx` (viewer-scoped bell + sidebar item + badge)

**Assumptions / deferred**
- No real auth/roles: viewer is always the Admin derived from SubAccountContext. Manager visibility logic is implemented and unit-correct but only activates with a Manager session (none exists). Documented.
- Live bulk-upload events don't carry the uploading subaccount yet → `accountName` undefined; visible to Admin in All-Accounts view. Capturing the subaccount at upload time is deferred.
- Bell unread badge reflects newly pushed notifications on RootLayout's next render (no global event bus).
- **Deferred performance task:** the recharts DataAnalytics route is still in the main bundle (~968 kB) — lazy-loading it remains a separate future task (explicitly out of scope here).
- **Deferred:** Zendesk integration and real notification APIs remain stubbed/mock.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (968 kB).

---

### Build Next — Bulk Upload account scoping + transaction batch linkage (2026-05-29)

Captured the uploading account on Bulk Upload records/events and linked bulk-origin transactions back to their batch.

**Upload account scoping (`bulkUploads.ts`)**
- New `UploadAccount` ({ accountId, accountName, accountType: 'main' | 'subaccount' }).
- `UploadRecord` and `UploadNotificationEvent` now carry `accountId`, `accountName`, `accountType`.
- `createUploadRecord(..., account)` requires the account; `updateUploadStatus` copies account fields onto the pushed notification event.

**Threading the active account (`BulkUploader.tsx`)**
- Reads `currentAccount` from `SubAccountContext` alongside `getCurrentAccountName()` and builds `uploadAccount` (`main`/'Main Account'/'main' when at parent; subaccount id + name + 'subaccount' otherwise). Passed into both `createUploadRecord` calls (fast + background).

**Notification scoping fix (`notifications.ts`)**
- Added optional `accountId` to `AppNotification` (carried through `pushNotification`).
- `uploadEventToNotification` now derives scope from the upload account:
  - main-account upload → `scope: 'parent'` (Admin-only),
  - subaccount upload → `scope: 'subaccount'` with the real `accountName`/`accountId`.
- Result: an Acme Luzon upload is visible to Admin (All Accounts), Admin drilled into Acme Luzon, and the Acme Luzon Manager — and hidden from other subaccount Managers. No more fake undefined-account uploads when an account is available. Unread/read behavior unchanged.

**Transaction batch linkage (`transactions.ts`)**
- New `TransactionBatch` ({ batchId, fileName, uploadedVia: 'bulk_upload', accountId?, accountName? }); optional `batch` field on `Transaction` and `RowSeed`.
- Three seed transactions tagged as bulk-origin with batchIds matching BulkUploader's Recent Uploads seeds (no dangling links):
  - GGX-2024-89240 → UPLOAD-2026-05-18-003 / daily_orders_batch3.xlsx / Acme Corporation
  - GGX-2024-89239 → UPLOAD-2026-05-18-002 / weekend_deliveries.xlsx / Acme Luzon
  - GGX-2024-89234 → UPLOAD-2026-05-18-001 / morning_batch.xlsx / Acme Luzon
- All other transactions remain normal non-bulk (no `batch`).

**Transaction Details display (`TransactionDetails.tsx`)**
- New "Upload Source" card rendered only when `transaction.batch` exists: "Uploaded via Bulk Upload" + Batch badge, batch file name, batch ID, account name, and a "View batch summary" button → `/dashboard/bulk-uploader/summary/:batchId`. Non-bulk transactions show nothing (section omitted). No redesign of the existing layout.

**Files changed**
- Modified: `src/app/data/bulkUploads.ts`, `src/app/pages/BulkUploader.tsx`, `src/app/data/notifications.ts`, `src/app/data/transactions.ts`, `src/app/pages/TransactionDetails.tsx`

**Assumptions / deferred**
- Subaccount ids in transaction batch data use names only (`accountName`); transaction mock has no stable subaccount id, so `batch.accountId` is left unset there. Upload records/events carry the real `accountId` from SubAccountContext.
- The batch summary page renders mock content for any batchId (no per-batch persistence), so seed-batch links resolve to a valid summary view.
- Still no real auth/roles — Manager visibility activates only with a Manager session (none exists); demo viewer is Admin.
- recharts DataAnalytics lazy-load remains a separate deferred performance task (~970 kB). Zendesk/notification APIs remain mock/stubbed.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (970 kB).

---

### Planning — Roadmap & backlog update (2026-05-30)

Documentation-only update (no app feature code changed). Added `ROADMAP.md` capturing the next Business Development enhancements plus one foundational data-model improvement, and repointed PROJECT_HANDOFF.md §14 "Next recommended task" to the foundational cleanup.

**Roadmap items added (all planned/backlog, not built):**
- **Stable Subaccount IDs (P0, foundational, next):** shared stable id map used by transactions, bulk uploads, batch records, notifications, SubAccountContext, and future claims/SLA/analytics. Visibility keys off `accountId` (name = display only); populate `batch.accountId` consistently.
- **Financial Security / OTP (P1):** OTP gate (mock code `123456`, 6 digits) on all financial/payout changes incl. Admin; prepare a mock attention-email event to the account holder on success; local/mock only.
- **Claims & Cancellations (P2):** refund claims on undelivered transactions (linked to tracking numbers, may notify, candidate sidebar item); cancellations only for newly booked transactions.
- **SLA Alerts / Ops Monitoring (P2):** No Movement / Breach SLA / follow-up alerts with hub/forwarder follow-up notes; may notify; frontend/mock.
- **Data Analytics Enhancements (P3, larger redesign):** Business Review (Zenith PH) metric set (Performance Overview, Total/Fulfilled Orders, Delivery Efficiency, RTS Rate, Returns, SLA HIT/MISS, avg delivery days by city/region, returns by reason/location, claims summary, amount settled, volume by region); reconsider peak-hours; treat as a redesign, not a chart refresh.

**Build priority:** Stable IDs → Financial/OTP → Claims & SLA (peers) → Data Analytics redesign.
**Dependencies:** Stable IDs unblock scoping for all later items; Claims feeds Analytics "claims summary"; SLA feeds "SLA HIT/MISS"; Analytics best sequenced last. recharts lazy-load remains a separate deferred performance task.

**Files changed:** added `ROADMAP.md`; updated `PROJECT_HANDOFF.md` (§14); this log note.

**Validation:** docs only — no build impact.
