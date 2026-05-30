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

---

### Build Next — Stable Subaccount IDs (foundational, ROADMAP item 0) (2026-05-30)

Migrated account/subaccount visibility & scoping to key off a stable id instead of display names.

**Canonical id map (`src/app/data/accounts.ts`, new)**
- `ACCOUNTS: AccountRef[]` with fixed ids: `main`, `acme-corporation`, `acme-luzon`, `acme-visayas`.
- Helpers `getAccountIdByName(name)` / `getAccountNameById(id)`; `MAIN_ACCOUNT_ID`.
- Single source for stable ids consumed by SubAccountContext, notifications, bulk uploads, transactions (and future claims/SLA/analytics).

**SubAccountContext bridge**
- Added `getCurrentAccountId()` exposed on the context. Returns `'main'` at parent level; otherwise bridges the (possibly runtime-generated) `currentAccount` to a canonical id via its display name (`getAccountIdByName(getCurrentAccountName()) ?? currentAccount`). This is the single name→id resolution point; everything downstream is id-based.

**Notification visibility migrated to id (`notifications.ts`)**
- `NotificationViewer` now carries `accountId` (the scoping key) plus `accountName` (display only). `useNotificationViewer()` sets `accountId` to `'all'` or `getCurrentAccountId()`.
- `isNotificationVisible` matches on `accountId` (Admin/all → all; Admin-in-subaccount → parent + global + matching id; Manager → global + matching id, never parent). `accountName` is no longer used for matching anywhere.
- Seed notifications tagged with canonical `accountId` (transactions/account/support → `acme-corporation`/`acme-luzon`); parent/global items carry no accountId.
- `uploadEventToNotification` already passes `accountId` from the event; scope still derived from `accountType` (main → parent, subaccount → subaccount).

**Upload account id (`BulkUploader.tsx`)**
- `uploadAccount.accountId` now uses `getCurrentAccountId()` (canonical) instead of the raw `currentAccount`. `createUploadRecord`/`updateUploadStatus` already capture and propagate `accountId` onto the notification event — confirmed, no change needed there.

**Transaction batch.accountId (`transactions.ts`)**
- The three bulk-origin seed transactions now carry canonical `batch.accountId` (`acme-corporation` / `acme-luzon`) alongside `accountName`. `accountName` on the batch remains display only.

**Visibility verification (by id)**
- Admin / All Accounts (`accountId: 'all'`) → sees everything.
- Admin drilled into a subaccount (`accountId: 'acme-luzon'`) → global + parent + that subaccount's items.
- Manager (`accountId: '<subaccount>'`, role `'manager'`) → global + that subaccount's items only; parent hidden. Manager branch is id-based and implemented but not actively triggered (no Manager login; demo viewer is Admin) — documented.

**Files changed**
- Added: `src/app/data/accounts.ts`
- Modified: `src/app/contexts/SubAccountContext.tsx`, `src/app/data/notifications.ts`, `src/app/pages/BulkUploader.tsx`, `src/app/data/transactions.ts`

**Assumptions / deferred**
- `accountName` retained on viewer/notifications/batch for display only; never used for matching.
- Runtime-created subaccounts (via Enable/Request flows) get arbitrary ids; the name→id bridge resolves known demo names to canonical ids. Assigning canonical ids at subaccount-creation time is deferred.
- The Transactions list still filters by subaccount *name* (its own UI filter) — out of scope here; batch linkage and notification scoping are now id-based. Migrating the Transactions list filter to ids is a follow-up.
- Support-ticket runtime notifications still omit accountId (submitting subaccount unknown) → visible to Admin/All; documented.
- recharts lazy-load and Zendesk/notification APIs remain deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (970 kB).

---

### Build Next — Financial Security / OTP Verification (ROADMAP item 1) (2026-05-30)

Added an always-required OTP gate for sensitive parent-level financial actions, plus a mock attention-email event and security log.

**Reusable OTP dialog (`src/app/components/ui/OtpDialog.tsx`, new)**
- DS `Dialog`-based; props: `open`, `onClose`, `onVerified`, `title`, `description`, `actionLabel`, `elevated`.
- 6-digit numeric input (digits only, max 6), Verify disabled until 6 digits; mock code `123456`; inline "Invalid code. Please try again." on mismatch with retry; helper note "For this mock, use 123456." Verify via button or Enter. Resets on open.

**OTP behavior**
- Required before committing every sensitive financial change — applies even to the Admin/account holder.
- Sequential modal flow (no triple-stacking): the originating form/confirm closes, then OTP opens; values are captured in a closure (`OtpAction.run`) and only execute on successful verify. Wrong code blocks completion and allows retry.

**Sensitive parent-level financial actions covered (all OTP-gated)**
- Bank account: add, edit, remove, set as primary (payout change).
- Payment method: add, edit, remove, set as default.
- Add flows are now functional (previously stub buttons): Add Payment Method and Add Bank Account dialogs → OTP → local save.
- Remove keeps the existing confirm dialog, then requires OTP before final removal (Remove → Confirm → OTP → remove → event).

**Parent-level financial access assumption**
- Financial actions are parent/main-account only. Payment Settings is already absent from `subaccountNavigation`; additionally `financialAccessAllowed = !subAccountsEnabled || isMainAccountView()` hides all action controls when an Admin is drilled into a specific subaccount, showing an amber "managed at the parent level" notice. No Manager-level financial restrictions were built because Managers have no financial actions at all (no access). No broader permissions system added.

**Attention email + security event (`src/app/data/financialSecurity.ts`, new)**
- `recordFinancialChange(action, accountName?)` runs after a verified change and: (1) pushes a mock `AttentionEmailEvent` (eventType `financial_update_attention`, recipient = account holder, subject "Important: Financial account details were updated", body, action, timestamp, accountName?) — no real email; (2) appends a `SecurityLogEntry` ({ action, actor, accountName?, timestamp, otpVerified: true }); (3) surfaces a parent-scoped `account` notification via `pushNotification` (Admin-only).
- `getAttentionEmails()` / `getSecurityLog()` exported for a future Security/Activity screen.

**Files changed**
- Added: `src/app/components/ui/OtpDialog.tsx`, `src/app/data/financialSecurity.ts`
- Modified: `src/app/pages/PaymentSettings.tsx` (parent-level gate, OTP-gated add/edit/remove/set-default, functional add forms)

**Assumptions / deferred**
- OTP is mock (`123456`); no real delivery. Account holder hardcoded as "Max Rodriguez" (matches topbar); a real app resolves from session.
- Security/audit log and attention-email events are in-memory with no UI to browse them yet (getters exported; Security/Activity screen deferred).
- "Set as Default/Primary" are now OTP-gated and functional (were stubs).
- recharts lazy-load and Zendesk/notification APIs remain deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (979 kB).

---

### Build Next — Claims & Cancellations (ROADMAP item 2) (2026-05-30)

Added a mock Claims feature (refunds on undelivered transactions) and cancellation for newly-booked transactions, id-scoped via the canonical account map.

**Claims data (`src/app/data/claims.ts`, new)**
- `Claim` model + `ClaimStatus` (open/in-review/approved/denied/settled) + `CLAIM_STATUS_META` (badge variants) + `CLAIM_REASONS`.
- Seed claims linked to existing undelivered transactions (GGX-2024-89236 / Acme Luzon, GGX-2024-89231 / Acme Corporation) with canonical `accountId`.
- `getClaims`, `getClaim`, `getClaimByTracking`.
- `submitClaim(input)` → creates a claim, prepends it, and pushes a `transaction`-category notification scoped by `accountId` (resolved via `getAccountIdByName`); links to `/dashboard/claims`.
- Cancellations: `requestCancellation(tracking, accountName?)` records the tracking number and pushes a `transaction` notification; `isCancelled(tracking)` query.
- Eligibility helpers: `isClaimEligible(status)` (failed/returned/in-transit/picked-up) and `isCancelEligible(status)` (pending only).

**Claims page (`src/app/pages/Claims.tsx`, new)**
- Route `/dashboard/claims`. Status filter, info card, and a claims table (Claim ID, Tracking, Reason, Amount, Status, Filed); rows link to the related transaction. Empty state included.

**Transaction Details integration**
- New "Claims & Cancellation" card (no redesign): shows existing claim + status badge; "File a Claim" when eligible (undelivered, no existing claim) → claim dialog (reason select + details, prefilled refund = COD amount) → `submitClaim`; "Cancel Booking" when eligible (pending) → confirm dialog → `requestCancellation` → cancelled banner. The card only renders when at least one of these applies.
- File-a-claim and cancel use the transaction's `subaccount` for id-scoped notifications.

**Sidebar**
- Added a "Claims" nav item (IconReceiptRefund) after Transactions in all three nav variants (standard / main / subaccount) — claims are order-level and relevant in subaccount context too.

**Notification category decision**
- Reused the existing `transaction` category for claim/cancellation notifications (order-level) rather than adding a new category — avoids touching the tabbed Notifications page + CATEGORY_META. Scoped by `accountId`.

**Files changed**
- Added: `src/app/data/claims.ts`, `src/app/pages/Claims.tsx`
- Modified: `src/app/routes.tsx` (route), `src/app/layouts/RootLayout.tsx` (nav item + icon), `src/app/pages/TransactionDetails.tsx` (claims/cancellation card + dialogs), `ROADMAP.md` (statuses), `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- Claims/cancellations are in-memory mock; reset on full reload. No claim detail page (claims link to the related transaction); a dedicated claim detail/lifecycle-management screen is deferred.
- Cancellation does not mutate the static transactions array — it records a cancelled flag + notification and shows a cancelled banner on the detail page (documented). Reflecting cancelled status in the Transactions list is deferred.
- Claim notifications reuse the `transaction` category; a dedicated `claim` category is deferred.
- recharts lazy-load, SLA Alerts, Analytics redesign, Zendesk/APIs remain deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (988 kB).

---

### Build Next — SLA Alerts / Operations Monitoring (ROADMAP item 3) (2026-05-30)

Added a mock SLA/ops monitoring layer with No Movement / Breach SLA alerts and follow-up tracking, id-scoped and surfaced via notifications.

**SLA data (`src/app/data/slaAlerts.ts`, new)**
- `SlaAlert` model + `SlaAlertType` (no_movement / breach / follow_up) + `SlaAlertStatus` (open / monitoring / resolved); `SLA_TYPE_META` (icon/colors/badge) and `SLA_STATUS_META` (badge variants).
- Seed alerts linked to existing in-transit/picked-up/failed transactions, id-scoped (`acme-luzon` / `acme-corporation`), each with an assigned hub/forwarder; two carry follow-up notes.
- `getSlaAlerts`, `getSlaAlert`.
- `sendFollowUp(id, note?)` — sets a follow-up note (default "Follow-up sent to {assignedTo}."), bumps `open → monitoring`, and pushes a `transaction`-category notification scoped by `accountId`.
- `resolveAlert(id)` — marks resolved.

**SLA Alerts page (`src/app/pages/SlaAlerts.tsx`, new)**
- Route `/dashboard/sla-alerts`. Type filter; summary cards (No Movement, Breach SLA, Action Needed). Alert cards show type + status badges, detail, linked tracking number (→ transaction), assigned hub/forwarder, account, timestamp, and the follow-up note when present. Actions: "Send follow-up" and "Mark resolved" (update module state + local view). Resolved alerts dimmed; empty state included.

**Sidebar**
- Added "SLA Alerts" nav item (IconActivityHeartbeat) after Claims in all three nav variants.

**Notification category decision**
- Reused the `transaction` category for SLA follow-up notifications (order-level, id-scoped) — consistent with claims; avoids touching the tabbed Notifications page / CATEGORY_META.

**Files changed**
- Added: `src/app/data/slaAlerts.ts`, `src/app/pages/SlaAlerts.tsx`
- Modified: `src/app/routes.tsx` (route), `src/app/layouts/RootLayout.tsx` (nav item + icon), `ROADMAP.md` (status), `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- SLA alerts are static/in-memory mock (no real monitoring engine); follow-up/resolve state resets on full reload.
- "Send follow-up" uses a default note (no note-entry dialog) for a one-click demo; a custom-note dialog is a possible enhancement.
- SLA notifications reuse the `transaction` category; a dedicated `sla` category is deferred.
- No SLA indicator added to Transaction Details this round (alerts link to the transaction); optional follow-up.
- recharts lazy-load, Analytics redesign, Zendesk/APIs remain deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. Bundle size warning is the pre-existing recharts issue (997 kB).

---

### Build Next — Data Analytics redesign + recharts lazy-load (ROADMAP item 4) (2026-05-30)

Redesigned the Data Analytics page around the Business Review (Zenith PH) metric set and code-split the recharts-heavy route, resolving most of the long-standing bundle-size warning.

**Analytics redesign (`src/app/pages/DataAnalytics.tsx`, rewritten)**
- Replaced the old layout (and removed the peak-hours card, deemed not relevant).
- Performance Overview KPI row: Total Orders, Fulfilled Orders, Delivery Efficiency, RTS Rate.
- Secondary KPI row: SLA Hit/Miss, Returned / For Return, Claims, Amount Settled.
- Charts: Monthly Order Volume (bar), Fulfillment vs RTS Trend (line), SLA Hit/Miss (donut), Volume Sharing by Region (pie).
- Lists: Avg. Delivery Days by Area, Returns by Reason (bars), Claims Summary (status breakdown).
- Region filter replaces the old brand filter.
- **Derived from real mock modules:** Claims summary + total/open and settled amount from `getClaims()`; active SLA breaches from `getSlaAlerts()`. Volume/efficiency/region/returns remain curated mock aggregates.

**recharts lazy-load (`routes.tsx`)**
- `DataAnalytics` is now `React.lazy`-loaded and rendered inside `<Suspense>` (fallback: "Loading analytics…"); all other routes unchanged.
- recharts now ships as a separate ~431 kB chunk (`DataAnalytics-*.js`); the main bundle dropped from ~997 kB to ~570 kB. Main is still marginally above Vite's 500 kB warning threshold, so the warning persists but is greatly reduced — further route-level splitting is an optional follow-up.

**Files changed**
- Modified: `src/app/pages/DataAnalytics.tsx` (rewrite), `src/app/routes.tsx` (lazy + Suspense), `ROADMAP.md` (statuses + cross-cutting note), `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- Most analytics figures are curated mock; only claims + active SLA breaches are derived live. Real metric wiring would need a backend/analytics source.
- Period/region filters are UI-only (do not recompute the mock figures).
- Main bundle (~570 kB) still slightly over the 500 kB warning; further code-splitting deferred.
- Zendesk/real APIs, auth/route guards, persistence, dark mode remain deferred.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts split into a ~431 kB lazy chunk; main bundle ~570 kB (down from ~997 kB).

---

### Milestone / Docs — Roadmap complete; next horizon documented (2026-05-30)

Documentation-only update (no app feature code changed). All five roadmap items (Stable Subaccount IDs, Financial/OTP, Claims & Cancellations, SLA Alerts, Data Analytics redesign) are complete.

- **ROADMAP.md** rewritten: completed-roadmap summary + what each delivered; current shipped feature set; mock/frontend-only limitations; remaining foundations (auth + route guards → persistence → backend/API); next implementation task (Authentication + Route Guards) with rationale for sequencing it before persistence and a risks/assumptions section.
- **PROJECT_HANDOFF.md** §13–14 updated: §13 now lists completed roadmap + shipped systems; §14 captures current limitations and sets the next recommended task to Authentication + Route Guards (with the "why before persistence" rationale).
- No build run needed — docs only.

**Files changed:** `ROADMAP.md`, `PROJECT_HANDOFF.md`, `IMPLEMENTATION_LOG.md`.

---

### Build Next — Mock auth + route guards + persistence + role QA (2026-05-30)

Added the foundation/stability layer: mock authentication, route protection, localStorage persistence, and a role/access QA pass. Frontend/mock only; no backend.

**Mock authentication (`src/app/contexts/AuthContext.tsx`, new)**
- `AuthUser` { name, email, role ('admin'|'manager'), accountId, accountName }; `useAuth()` with `login`/`logout`/`isAuthenticated`.
- `DEMO_USERS`: Admin (`max@email.com` → accountId `main`) and Manager (`manager@email.com` → accountId `acme-luzon`); shared demo password `!1234qwer`.
- Session persisted to `localStorage` (`ggx.auth`); restored on load.
- `AuthProvider` wraps the app (outermost, above `SubAccountProvider`).

**Login (`Login.tsx`)**
- Resolves the demo user, calls `login()`, navigates to `/dashboard`. Added "Demo sign-in" Admin/Manager quick-fill buttons. Redirects to `/dashboard` if already authenticated.

**Route guards (`src/app/components/RouteGuards.tsx`, `AccessDenied.tsx`, new)**
- `ProtectedRoute` wraps `/dashboard` — unauthenticated users redirect to `/`.
- `AdminRoute` wraps Admin-only routes (earnings, billing, payment-settings, reports, subaccounts*, users-permissions) — Managers get a minimal in-shell access-denied state (not a blank page).
- Shared routes (dashboard, transactions, claims, sla-alerts, bulk-uploader, analytics, address-book, api-access, support-tickets, notifications, advisories, settings) available to both roles.

**Role-aware nav + identity (`RootLayout.tsx`)**
- Managers always get the subaccount nav (no parent-level finance/reports/subaccounts/users). Account switcher and account-menu "Switch" hidden for Managers. Topbar/account-menu identity now driven by the auth user (name/email/accountName).
- Logout clears the auth session then navigates to `/`.

**Notification scoping by session role (`notifications.ts`)**
- `useNotificationViewer()` now derives the viewer from `useAuth()`: Manager → `{ role:'manager', accountId: <their subaccount> }`; Admin → existing all/drilled-in logic. Visibility remains id-based.

**Persistence (`src/app/lib/storage.ts`, new + wiring)**
- Namespaced (`ggx.`) `loadState`/`saveState`/`clearState` with graceful failure.
- Persisted: auth session; subaccount selection/state (`SubAccountContext` via effect); seed notification read-state (read ids in `notifications.ts`); claims + cancellations (`claims.ts`); SLA alerts (`slaAlerts.ts`); recent uploads (`bulkUploads.ts`).
- Not persisted (by design): mock OTP values (never stored), runtime/upload-event notification read-state (session-scoped), security-log/attention-email events, transient form state.

**Parent-level financial gate (`PaymentSettings.tsx`)**
- `financialAccessAllowed` now also requires `role === 'admin'` (defense-in-depth alongside the AdminRoute guard). OTP flow unchanged.

**Role/access QA results (pass)**
- Unauthenticated direct URL to any `/dashboard/*` → redirected to Login. ✓
- Admin login → full nav + all routes; Manager login → subaccount nav only. ✓
- Manager direct URL to Admin-only pages → access-denied (in-shell). ✓
- Refresh after login keeps session (persisted); visiting `/` while authed → `/dashboard`. ✓
- Logout clears session → Login. ✓
- Manager notifications scoped to their subaccount + global (parent/other-subaccount hidden). ✓
- Claims/SLA/bulk-summary/transaction-detail links intact; OTP still gates financial changes (Admin-only). ✓
- No stray hardcoded identity in feature UI (only auth demo users, safe fallbacks, seeds).

**Files changed**
- Added: `src/app/contexts/AuthContext.tsx`, `src/app/components/RouteGuards.tsx`, `src/app/components/AccessDenied.tsx`, `src/app/lib/storage.ts`
- Modified: `src/app/App.tsx`, `src/app/routes.tsx`, `src/app/pages/Login.tsx`, `src/app/layouts/RootLayout.tsx`, `src/app/data/notifications.ts`, `src/app/data/claims.ts`, `src/app/data/slaAlerts.ts`, `src/app/data/bulkUploads.ts`, `src/app/contexts/SubAccountContext.tsx`, `src/app/pages/PaymentSettings.tsx`, `ROADMAP.md`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- Mock auth only (no real provider); `AuthContext` is the seam for a future real auth API.
- Manager account context is authoritative for notification visibility; other account-context reads (bulk-upload scoping, PaymentMethodTabs billing) still derive from `SubAccountContext` for the demo — deeper manager-context wiring deferred.
- Runtime/upload-event notification read-state not persisted (session-scoped); only seed read-state persists.
- No real roles/permissions service; Admin/Manager is the mock model.
- recharts main bundle (~574 kB) still slightly over the 500 kB warning; backend/API integration is the next foundation.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts remains a separate ~431 kB chunk; main bundle ~574 kB.

---

### Follow-up — Persist runtime notifications + Manager bulk-upload context (2026-05-30)

Two consistency follow-ups to the auth/persistence layer.

**Runtime notification persistence (`notifications.ts`)**
- `RUNTIME_NOTIFICATIONS` (session-generated: claims, SLA follow-ups, financial changes, submitted support tickets) now hydrates from `localStorage` (`ggx.runtimeNotifs`) and persists on push and on read-state changes (`markAllNotificationsRead` / `markVisibleNotificationsRead`). Capped to the latest 50 to bound storage.
- Result: session-generated alerts and their read-state now survive reload (previously seed read-state only).

**Manager bulk-upload account context (`BulkUploader.tsx`)**
- Bulk Upload now reads the auth user: a Manager uploads under their assigned subaccount (`accountId`/`accountName` from the session, `accountType: 'subaccount'`); an Admin still uses the active `SubAccountContext` account.
- `activeAccountName` (drives billing availability + PaymentMethodTabs key) and `uploadAccount` (drives upload record/event scope) both reflect the Manager's subaccount.
- Result: a Manager's uploads and their completion notifications are correctly scoped to the Manager's subaccount (visible to that Manager and to Admin), instead of defaulting to parent scope.

**Files changed**
- Modified: `src/app/data/notifications.ts`, `src/app/pages/BulkUploader.tsx`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- PaymentMethodTabs billing still derives from account name (now the Manager's subaccount for managers) — unchanged logic, correct result.
- Upload-event `PENDING_NOTIFICATIONS` read-state remains session-scoped (uploads list persists; their derived bell events do not) — unchanged from prior task.
- Backend/API integration remains the next foundation.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts ~431 kB chunk; main bundle ~574 kB.

---

### Checkpoint / Docs — Foundation & stability complete (2026-05-30)

Documentation-only update (no app feature code changed). Refreshed the handoff/checkpoint after the foundation/stability work.

- **PROJECT_HANDOFF.md** updated: §1 current state (auth-guarded, foundations complete, two demo logins, recharts code-split); §5 completed-features summary; §13 now documents the foundation/stability layer (mock auth, route guards, Admin/Manager access, persistence, notification scoping, Bulk Upload scoping) alongside the five shipped roadmap items; §14 rewritten as Limitations, Risks & Next Horizon — backend/API integration is the next foundation, starting with real authentication; added a "Read first" pointer list for future sessions.
- **ROADMAP.md** already current (foundations 1–2 marked done last task; backend/API is "next") — no change needed.
- No build run needed — docs only.

**Files changed:** `PROJECT_HANDOFF.md`, `IMPLEMENTATION_LOG.md`.

---

### Housekeeping — Batch 1: Subaccount and user-management alignment (2026-05-30)

Five targeted fixes to align subaccount data, user terminology, navigation, and the account-switcher UX. Frontend/mock only. No new dependencies.

**Change 1 — "Invite User" → "Add User" (ParentDashboard.tsx)**
- Quick Action card label changed from "Invite User" to "Add User"; description updated to "Assign managers to subaccounts". Aligns with the terminology used throughout the rest of the app (Users & Permissions uses "Add user access" / "Add User" button).
- Recent Activity copy updated: "New user invited" → "New user added".

**Change 2 — Subaccounts seed alignment (EnableSubAccountsSetup.tsx)**
- `enableSubAccounts` now creates Acme Corporation (`id: acme-corporation`) as the default subaccount with canonical id and realistic mock data (bookingCount, manager, address).
- `addSubAccount` immediately appends Acme Luzon (`id: acme-luzon`, `assignedManager: Sarah Williams`) so the Subaccounts page always shows two entries matching the Users & Permissions seed.
- SubAccountContext API unchanged.

**Change 3 — 2-Manager cap + multi-subaccount Manager assignment (UsersPermissions.tsx, data/users.ts)**
- Extracted shared user seed to `src/app/data/users.ts` (`AppUser`, `INITIAL_USERS`, `SUBACCOUNT_OPTIONS`) so SubAccountSettings can also reference the manager data without duplicating it.
- `AppUser.subaccount: string` → `AppUser.subaccounts: string[]` (array of assigned subaccount names).
- Cap raised to 2 Managers per subaccount (`MAX_MANAGERS_PER_SUBACCOUNT = 2`).
- Subaccounts at capacity show a `(Full)` suffix and are `disabled` in the assignment Select. The replace-manager dialog is removed — the disabled option is the UX gate.
- Adding a user whose email already exists as a Manager merges the new subaccount into their existing row rather than creating a duplicate.
- Table "Role / Assigned accounts" cell lists all subaccounts stacked under the Manager badge.
- Access column reads "N subaccounts" for multi-subaccount managers.
- Seed updated: Mike Johnson is assigned to both Acme Corporation and Acme Luzon to demonstrate the capability.

**Change 4 — Wire "Manage Users" / "Settings" + SubAccount Settings page (SubAccounts.tsx, SubAccountSettings.tsx, routes.tsx)**
- "Manage Users" button on each subaccount card now navigates to `/dashboard/users-permissions?subaccount=<canonical-id>`.
- UsersPermissions reads `?subaccount` param via `useSearchParams`, filters the user list, and shows a dismissible blue info banner ("Showing users for [Name]. Clear filter to see all.").
- "Settings" button navigates to `/dashboard/subaccounts/:id/settings`.
- New `SubAccountSettings.tsx` page at that route (shared — not Admin-only so Managers can view their own). Three sections:
  1. **Subaccount Info** — name, canonical id, type badge, status badge, booking count, contact.
  2. **Assigned Managers** — reads from `INITIAL_USERS` filtered by subaccount name; shows avatar + name + email + Manager badge. Links to Users & Permissions filtered view.
  3. **Pickup Address** — displays `subAccount.pickupAddress` text with "Edit in Address Book" link.
  - Breadcrumb: `Subaccounts › [Name] › Settings`.
  - Not-found state with warning banner for invalid/unloaded ids.

**Change 5 — Account switcher: centered Dialog modal (RootLayout.tsx)**
- Replaced `handleOpenAccountSwitcher` → sidebar expansion with a centered `Dialog` modal (`switchAccountModalOpen` state).
- The "Switch" button in the topbar account menu now opens the modal (previously opened the bottom-left sidebar panel — spatially confusing).
- Modal body: scrollable list of Main Account + all subaccounts. Active account has a blue highlight + `IconCheck`. Each row calls `handleSwitchAccount(id)` and closes the modal.
- Footer: "Manage Subaccounts" link to `/dashboard/subaccounts`.
- The sidebar bottom account-switcher panel remains intact as a secondary path.
- `Dialog` added to the RootLayout import (previously only `ConfirmDialog` was imported).

**Files changed**
- Added: `src/app/data/users.ts`, `src/app/pages/SubAccountSettings.tsx`
- Modified: `src/app/pages/ParentDashboard.tsx`, `src/app/pages/EnableSubAccountsSetup.tsx`, `src/app/pages/UsersPermissions.tsx`, `src/app/pages/SubAccounts.tsx`, `src/app/routes.tsx`, `src/app/layouts/RootLayout.tsx`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- `SubAccount.assignedManager` (single string on the context type) is kept for SubAccounts list display. The definitive manager list for a subaccount lives in `data/users.ts` and is consumed by SubAccountSettings. Aligning the context type to an array is deferred.
- SubAccountSettings reads from `INITIAL_USERS` (static seed) — runtime adds/removes from UsersPermissions local state are not reflected until those are wired to a shared store.
- The 2-manager cap is enforced only in the Add/Edit modal UI (disabled select option); no server-side guard exists.
- Acme Visayas remains in `data/accounts.ts` canonical map but has no corresponding subaccount seed (it's used for notification scoping tests only).

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts remains a separate ~431 kB chunk; main bundle ~584 kB (pre-existing warning).

---

### Housekeeping — Batch 1 Fix: Subaccount/user-management alignment corrections (2026-05-30)

Follow-up corrections to Batch 1. Addresses the root cause of missing subaccounts, aligns manager assignment logic, improves all related pages, and makes Settings context-aware. Frontend/mock only.

**Root cause fix — subaccounts missing from all switchers**
- `SubAccountContext.tsx`: Added `DEMO_SUBACCOUNTS` constant (both Acme Corporation + Acme Luzon with canonical IDs and authoritative mock data).
- Added `mergeWithDemoSubaccounts()`: on provider init, if `subAccountsEnabled === true`, any canonical demo subaccounts missing from persisted localStorage state are merged in. This is a migration fix for sessions where only one subaccount was previously saved.
- `enableSubAccounts()` signature simplified: always seeds `DEMO_SUBACCOUNTS` regardless of `firstSubAccount` argument (arg kept for backwards compat but ignored). After enabling, `currentAccount` starts at `'main'` (Main Account view) rather than jumping directly into a subaccount.
- All switchers (topbar modal, sidebar panel, account options array) derive from `subAccounts` in context — fixing the context fixes all of them at once.
- `EnableSubAccountsSetup.tsx`: removed the now-redundant `addSubAccount` call; updated success screen copy to name both subaccounts.

**`data/users.ts` — IDs, module state, helpers**
- `AppUser.subaccounts?: string[]` now stores canonical **subaccount IDs** (not names). All matching uses IDs.
- INITIAL_USERS seed updated: `['acme-corporation', 'acme-luzon']` instead of display names.
- Module-level mutable state (`SESSION_USERS`) with `getUsers()`/`setUsers()` — same pattern as claims/SLA. Both `UsersPermissions` and `SubAccountSettings` share the same live state so manager changes are reflected cross-page within a session.
- New helpers: `getManagersForSubaccount(id)`, `getSubaccountManagerCount(id, excludeUserId?)`, `getSubaccountName(id)`.

**`UsersPermissions.tsx` — clean model, multi-checkbox**
- Uses `getUsers()`/`setUsers()` (module state) instead of isolated local seed.
- `subaccountFilterId` filter now matches on IDs directly (no name lookup needed).
- **Add User**: prevents duplicate email (`User already exists. Use Edit…`). Does not merge into existing users.
- **Edit User**: replaced single Select with a styled checkbox list. Each subaccount shows capacity `(1/2 managers)` or `Full`. Admin cannot select a full subaccount unless the user being edited is already assigned to it. Both Add and Edit support selecting multiple subaccounts.
- Removed the confusing "Main account — Admin already assigned" Select option.
- Table display resolves subaccount names from IDs via `getSubaccountName()`.

**`SubAccounts.tsx` — Primary/Backup display, removed Manage Users**
- Removed the "Manage Users" button (manager assignment is now handled in Subaccount Settings per the "move to Settings if complex" guidance; navigating away broke the page-level UX).
- Added `ManagerSlot` component: shows Primary Manager and Backup Manager slots per subaccount card, using `getManagersForSubaccount(id)` from the module. Vacant slots show "Vacant" with a placeholder icon.
- Subaccount card layout updated: 4-column grid (Primary Manager | Backup Manager | Pickup Address | Total Bookings).

**`SubAccountSettings.tsx` — Admin-editable manager assignment**
- Manager section uses `getUsers()`/`setUsers()` for live data; local React state mirrors the module.
- Admin view: "Edit Assignments" button reveals two `Select` dropdowns (Primary Manager, Backup Manager). Options exclude the other slot's selection. Saving validates no duplicates and rewires the `AppUser.subaccounts` arrays in module state.
- Manager view: read-only display (no Edit button). Note: "Manager self-service assignment deferred — requires activity logs and stricter permissions."
- "Vacant" displayed for empty slots.

**`Settings.tsx` — context-aware subaccount banner**
- When viewing a specific subaccount (`subAccountsEnabled && !isMainAccountView()`): shows a blue info card at the top explaining the page is main-account settings, with a link to the subaccount's dedicated settings page.
- Page subtitle updates to "Main account settings — you are viewing as [Subaccount Name]".
- All existing sections (Account Info, Notifications, Security, Enable Subaccounts promo) are unchanged.

**Files changed**
- Modified: `src/app/data/users.ts`, `src/app/contexts/SubAccountContext.tsx`, `src/app/pages/EnableSubAccountsSetup.tsx`, `src/app/pages/UsersPermissions.tsx`, `src/app/pages/SubAccounts.tsx`, `src/app/pages/SubAccountSettings.tsx`, `src/app/pages/Settings.tsx`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- `SubAccount.assignedManager: string` field kept on the SubAccount type (display-only). The definitive manager list per subaccount is derived from `data/users.ts`. These two are intentionally separate — context field is a snapshot, users module is the source of truth.
- `SESSION_USERS` is in-memory (module-level); refreshing the page resets to `INITIAL_USERS`. Persistence of user changes is deferred until backend integration.
- Manager self-service assignment (a Manager assigning another Manager) is deferred — requires activity log infrastructure per product rules.
- The 2-manager cap is enforced in UI only; no server-side validation.
- Email editing is disabled in the Edit User modal (email is the unique key; enabling edits would require a proper user identity system).
- Acme Visayas stays in `data/accounts.ts` canonical map for notification scoping; no subaccount seed needed.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts ~431 kB lazy chunk; main bundle ~591 kB (pre-existing warning).

---

### Fix — Canonical subaccount list: remove duplicate, add Acme Visayas (2026-05-30)

Targeted two-file fix. No UI or logic changes beyond the data correction.

**Root cause of duplicate Acme Corporation**
`mergeWithDemoSubaccounts()` was filtering persisted localStorage entries by ID only. Old sessions stored Acme Corporation with `id: 'sub-1'` (the legacy id used before Batch 1). Since `'sub-1'` is not in `DEMO_IDS`, it passed the filter and appeared alongside the new canonical `acme-corporation` entry — two cards with the same name.

**Fix: filter by both ID and name**
```
const runtime = existing.filter(
  (sa) => !DEMO_IDS.has(sa.id) && !DEMO_NAMES.has(sa.name)
);
```
Any entry that matches a demo subaccount by either ID or name is replaced by the canonical `DEMO_SUBACCOUNTS` entry.

**Acme Visayas added**
- Added to `DEMO_SUBACCOUNTS` in `SubAccountContext.tsx` with canonical id `acme-visayas`, type `additional`, status `active`, bookingCount 1842, Cebu pickup address. No manager assigned by default.
- Added to `SUBACCOUNT_OPTIONS` in `data/users.ts` so it appears in the Users & Permissions Add/Edit modal and in `getSubaccountName()` lookups.
- `data/accounts.ts` already contained `acme-visayas` — no change needed there.

**UI areas fixed by these two changes**
- Switch Account modal (topbar): now shows Main Account + 3 subaccounts, no duplicates.
- Bottom-left sidebar switcher: same fix (both derive from `subAccounts` in context).
- Subaccounts page: now shows 3 cards.
- Users & Permissions Add/Edit modal: Acme Visayas appears as an assignable option with capacity display.

**Files changed**
- Modified: `src/app/contexts/SubAccountContext.tsx`, `src/app/data/users.ts`, `IMPLEMENTATION_LOG.md`

**Note for testers**
If the browser still shows a duplicate, clear the `ggx.subaccount` key from localStorage (DevTools → Application → Local Storage) and reload. The `mergeWithDemoSubaccounts` migration handles it on next load, but a very old persisted session may need a manual clear once.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts ~431 kB lazy chunk; main bundle ~591 kB (unchanged).

---

### Housekeeping — Batch 2: Account-scoped views and notification subaccount tags (2026-05-30)

All changes are frontend/mock only. Pattern follows `Transactions.tsx` (existing reference implementation).

**Claims.tsx — account-scoped view**
- Imports `useSubAccounts` and `SUBACCOUNT_OPTIONS`.
- Main Account view: shows all claims + subaccount filter Select (by canonical id) + "Subaccount" table column (shows `accountName`).
- Subaccount view: filters `getClaims()` to `c.accountId === getCurrentAccountId()`; hides filter + column. Summary count reflects scoped claims only.

**SlaAlerts.tsx — account-scoped view**
- Same pattern. Main Account view: all alerts + subaccount filter + existing `accountName` inline label retained.
- Subaccount view: scoped to `a.accountId === getCurrentAccountId()`; stat cards count from scoped alerts only.

**data/reports.ts — accountId/accountName fields**
- Added `accountId?: string` and `accountName?: string` to `ReportItem` interface.
- `SEED_REPORTS` updated: settlement + delivery reports tagged to `acme-luzon`; analytics + delivery (Apr) tagged to `acme-corporation`; billing reports stay parent-level (no accountId).

**Reports.tsx — account-scoped view**
- Main Account view: shows all reports + subaccount filter in Available Reports card header + "Scope" column (shows `accountName ?? 'All accounts'`).
- Subaccount view: keeps untagged (parent-level) reports visible plus those matching `getCurrentAccountId()`; hides filter + Scope column.
- Page description updated to clarify Reports as a centralised export centre.

**Notifications subaccount tag (RootLayout.tsx + Notifications.tsx)**
- `NotificationRow` in Notifications.tsx: adds a compact gray pill tag below the title when `n.scope === 'subaccount' && n.accountName`.
- Bell popover in RootLayout.tsx: same tag in the same position.
- No visibility, tab, or read-state changes.

**ParentDashboard.tsx**
- "View All" on Subaccount Performance: changed link from `/dashboard/subaccounts` → `/dashboard/analytics` (points to deeper performance data). Button label changed to "View analytics".
- Bottom row: changed from 2-column to 3-column grid.
- New "Active SLA Alerts" card (third column): reads `getSlaAlerts()`, shows up to 3 open alerts with type icon, title, and subaccount name. Empty state shows green check "No active alerts". Footer links to `/dashboard/sla-alerts`.

**DataAnalytics.tsx — subaccount context banner**
- Imports `useSubAccounts` (hook only — no recharts changes).
- When `subAccountsEnabled && !isMainAccountView()`: renders a blue info banner above the KPI row: "Showing analytics for [name]. Switch to Main Account to see consolidated data."
- All charts and data unchanged; this is framing only.

**Files changed**
- Modified: `src/app/pages/Claims.tsx`, `src/app/pages/SlaAlerts.tsx`, `src/app/data/reports.ts`, `src/app/pages/Reports.tsx`, `src/app/layouts/RootLayout.tsx`, `src/app/pages/Notifications.tsx`, `src/app/pages/ParentDashboard.tsx`, `src/app/pages/DataAnalytics.tsx`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- Claims and SLA Alerts are pre-filtered by `accountId` from their seed data; Acme Visayas has no seed claims/alerts (vacant by design — correct behaviour).
- Reports `subaccountFilter` state is local; reset on navigation. Persistence deferred until backend.
- Analytics charts show the same curated mock data in both views — the banner is framing only. Per-subaccount chart data needs real backend metrics.
- Transactions subaccount filter still uses display names (not IDs) — out of scope for this batch; flagged as a follow-up.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts ~432 kB lazy chunk; main bundle ~595 kB (pre-existing warning).

---

### Housekeeping — Batch 3: Transaction/support/earnings flows (2026-05-30)

All changes are frontend/mock only. No new dependencies. No redesigns.

**Issue 18 — Transaction Details: inline "Send a Report" ticket modal**
- `TransactionDetails.tsx`: added `showReportModal`, `reportForm`, `reportSubmittedId` state; imported `submitTicket`.
- "Send a Report" button now opens a `Dialog` modal overlaid on the details page (no navigation away).
- Modal pre-displays the tracking number, has Issue Type Select (pre-selected "Delivery Failed") and Description textarea.
- On submit: calls `submitTicket()`, sets `reportSubmittedId`, closes modal. The "Need Help?" card then shows a green "Ticket submitted. View [ID]" link instead of the button.
- No page navigation needed to create a support ticket from a transaction.

**Issue 17 — Support Ticket file attachments (up to 5 files)**
- `data/supportTickets.ts`: added `TicketAttachment { name, size }` interface; added `attachments?` to `SupportTicket`, `TicketMessage`, and `SubmitTicketInput`; updated `submitTicket` and `addTicketReply` to accept and store attachments.
- `SupportTickets.tsx`: added `attachments` state, hidden `<input type="file">` via `ref`, `handleFileSelect`, `removeAttachment` helpers, `formatFileSize` utility. Attachment chips rendered with remove button. "Attach file (N/5)" trigger button shown when under cap. `handleSubmit` passes attachments to `submitTicket`.
- `SupportTicketDetail.tsx`: same pattern for reply composer. Attached files displayed as small chips inside the message bubble after send.
- Max 5 files. Accepted: `image/*,.pdf,.csv,.xlsx,.docx`. Files captured in local state only — no real upload.

**Issues 19-22 — Earnings: Settlement Detail page with breadcrumb and linked transactions**
- New `src/app/data/earnings.ts`: `Settlement` and `SettlementTransaction` interfaces, `SETTLEMENT_STATUS_CONFIG`, `SETTLEMENTS` array (5 settlements with 2-4 mock transactions each), `getSettlement(id)`. Tracking numbers re-use existing transactions.ts IDs where applicable.
- `Earnings.tsx`: imports settlements from `data/earnings` (removed inline const); uses `SETTLEMENT_STATUS_CONFIG` in place of local `statusConfig`; Settlement ID cells are now `<Link>` elements to `/dashboard/earnings/:id`.
- New `src/app/pages/EarningsSettlementDetail.tsx`: breadcrumb `Earnings › [Settlement ID]`; back button; 3 summary cards (gross / fees / net payout); transaction table (tracking number links → `/dashboard/transactions/:id`, recipient, destination, COD, fees, net, status badge); totals row; not-found state.
- `routes.tsx`: added `earnings/:settlementId` route under AdminRoute.

**Files changed**
- Added: `src/app/data/earnings.ts`, `src/app/pages/EarningsSettlementDetail.tsx`
- Modified: `src/app/pages/Earnings.tsx`, `src/app/pages/TransactionDetails.tsx`, `src/app/data/supportTickets.ts`, `src/app/pages/SupportTickets.tsx`, `src/app/pages/SupportTicketDetail.tsx`, `src/app/routes.tsx`, `IMPLEMENTATION_LOG.md`

**Assumptions / deferred**
- Settlement transactions are a small curated mock set per settlement; real reconciliation data would come from a backend ledger API.
- File attachments are local state only (no real upload). The Zendesk `syncTicketToZendesk` stub does not pass attachments through — noted as a future extension point.
- The "Send a Report" modal on TransactionDetails does not pre-select an issue type based on the transaction's delivery status (always defaults to "Delivery Failed"); a smarter default is a future enhancement.
- `EarningsSettlementDetail` is Admin-only (behind AdminRoute) matching the Earnings route.

**Validation result**
- `npm run build` (tsc -b + vite build) passes — 0 TypeScript errors. recharts ~432 kB lazy chunk; main bundle ~610 kB (+15 kB from new pages/data — pre-existing warning).
