# Session State — GGX Corporate

> Lightweight handoff file. Update at natural checkpoints during long or complex work.
> On session start: read this file silently, then confirm to the user what you're resuming.

---

## Current goal

All polish-pass roadmap items (1–4), Operations Requests (item 5), Data Analytics subaccount scoping, and the component/Figma polish pass (session 4) are complete. The service-layer migration is also complete (all non-config UI consumers go through service facades; intentional exceptions documented). The next stage is service-layer / backend integration — swapping mock service bodies for real `fetch()` calls against the BFF. This requires an actual backend to exist before meaningful work can proceed.

## Completed work

### Core infrastructure
- Service layer migration complete — all non-config UI consumers go through service facades
- Public tracking page `/track/:trackingNumber` (no auth required)
- Transaction seed expanded to 25 rows (May 12–31, diverse statuses, both subaccounts)
- Dashboard KPI cards + Delivery Performance card wired to `getDashboardStats()` from live seed
- Claim detail page `/dashboard/claims/:id` — full status timeline, linked transaction, refund card
- Seed claims expanded to 8 (open / in-review / approved / denied / settled)
- UX dead-end fixes: rating widget, proof-of-delivery modal, Share button, billing Pay Now, API key, Settings save states
- Claims list navigates to `/dashboard/claims/:id`; TransactionDetails claim row links there too
- Documentation restructure: CLAUDE.md + docs/

### Polish pass (items 1–4) — all complete
- **Responsive layout**: KPI card values scale `text-2xl xl:text-3xl`; trend row `flex-shrink-0`; "vs last month" `hidden xl:inline`; individual-booking copy removed from batch footer
- **Sidebar IA**: grouped hierarchy (Operations / Analytics & Reports / Finance / Account Management / System); static uppercase group labels; separate `managerNavigation`; `financeExpanded` toggle removed
- **Data Analytics scoping**: claims + SLA filtered by `subaccountId` in subaccount view; effect re-runs on scope change; KPI subtitle shows account name; `dataAnalyticsService` created — all aggregate metrics (KPIs, charts, regional breakdown) now scope correctly to subaccount context
- **Bulk Upload UX**: `reportedCounts` on `TransactionBatch`; 5 seed batches with 89–423 shipments; batch row redesigned (counters, progress bar, Export button)

### Operations Requests (item 5) — complete with fixes applied

**Feature**:
- `opsRequestsService`: `getOpsRequests()`, `getOpsRequestById()`, `submitOpsRequest()`
- 8 seed requests across supply / pickup support / operational assistance
- List page: summary StatCards, category/status/subaccount filters, request cards
- New request dialog: category picker, type-specific fields, success state

**Account/subaccount scoping — correct behavior per context**:
- **A — Admin, main view, 2+ subaccounts**: blank subaccount selector shown; no auto-default; user must choose; address populates after selection via `handleSubaccountChange()`
- **B — Admin, main view, 1 subaccount**: auto-selected; selector hidden; address pre-filled from that subaccount's `pickupAddress`
- **C — Admin viewing specific subaccount**: no selector; address from viewed subaccount's `pickupAddress`
- **D — Manager**: subaccount resolved via `user.accountName` lookup; no selector; address pre-filled; no redundant copy
- **E — Standard account (no subaccounts)**: no selector; address defaults to preferred address from Address Book via `getPreferredAddress()`

**Sidebar visibility**:
- Operations Requests is present in **all four** nav arrays: `standardAccountNavigation`, `mainAccountNavigation`, `subaccountNavigation`, `managerNavigation`
- It appears under the Operations group in all contexts
- Previously it was only in `standardAccountNavigation` — fixed in commit `1358d39`

**Address behavior**:
- `CompactAddressCard` component shows saved address in form; "Change" button opens Address Book picker
- `subToAddress()` synthesises an `Address` object from a `SubAccount`'s `pickupAddress`, `senderName`, `contactNumber`
- `getPreferredAddress()` exported from `AddressBook.tsx` (seed extracted to module level) for context E

### Shared component library additions
- `StatCard` — white card, label/value/sub left, icon-right in soft `bg-*-50` container
- `SegmentedControl` — generic pill toggle; extracted from inline Transactions code; used in Transactions page
- `CompactAddressCard` — inline address display + Change action for form contexts
- `Dialog` gains `lg` size (`max-w-2xl`)
- `IconContainer` (session 4) — shared component for the icon-in-colored-bg pill pattern; sm/md/lg sizes; `bg` + `color` + `rounded` props; StatCard now uses it
- `Button.iconEnd` (session 4) — new boolean prop; applies `flex-row-reverse` to place icon after label without changing JSX order conventions

### Stat card alignment
- Secondary pages use `StatCard`: SLA Alerts, Support Tickets, Reports, Billing Statements, Operations Requests
- Dashboard and Earnings keep vibrant colored-background cards (intentional primary treatment)

### Figma design system (GGX-SHADCN)
Pages added in session 3:
- Segmented Control (Active=First / Active=Second)
- Stat Card (7 color variants)
- Search Input (Empty / Filled / Focused)
- Address Display Card (4 label variants + Compact Address Card section)

Added in session 4:
- Button: "trailing icon" variant added (Variant=trailing icon, Size=default, State=default + hover) — icon appears on the right of the label, contrasting the existing "with icon" (icon left) variant
- Icon Container: already existed (sm/md/lg/xl × 7 colors). No changes needed.

Added in session 5 (Figma screen construction):
Pages built (all use real GGX nav, consistent topbar, StatCard instances where applicable):

| Page | Frame(s) | Notes |
|------|----------|-------|
| GGX Dashboard | Admin Main Account · Admin Subaccount View · Manager View | 3 context banners (emerald/blue/violet), nav scoped per role |
| GGX / Transactions | All Transactions · By Batch | Segmented control, status badge table, batch cards w/ counter badges + progress bars + inline expanded table |
| GGX / Transaction Detail | Transaction Detail | 2-col: dates/sender/fees left; rating card/timeline/help right |
| GGX / Data Analytics | Data Analytics | StatCard instances, bar chart, donut status dist, SLA progress bars, regional breakdown |
| GGX / Earnings | Earnings | 4 vibrant summary cards, full settlement table w/ Disbursed badges |
| GGX / Support Tickets | Support Tickets | StatCard instances, dual status+priority badge table |
| GGX / Claims | Claims | StatCard instances, claims table: Open/InReview/Approved/Settled/Denied |
| GGX / Bulk Uploader | Bulk Uploader | Drag-drop zone, subaccount selector banner, recent batches with progress |
| GGX / SLA Alerts | SLA Alerts | StatCard instances, alert rows with time-remaining coloring (−2h red, warning orange) |
| GGX / Operations Requests | Operations Requests | StatCard instances, dual category+status badges, request cards |
| GGX / Address Book | Address Book | 3-col card grid, preferred address blue border, type badges, Edit/Delete/Set actions |

Gap log / assumptions:
- Sidebar icon dots are small gray rectangles (no Tabler icon instances) — accurate layout, placeholder visual
- KPI card trend arrows are text-only ("+12.5% vs last month")
- Rating stars are yellow/gray circles (no star SVG instances)
- Fee row amounts occasionally concatenate to labels (FILL spacer inconsistency in AUTO-width rows) — acceptable mock fidelity
- StatCard instances used wherever the StatCard component set was the right pattern (secondary pages); Dashboard KPI cards use custom vibrant frames (matching the code intentional treatment)

Added in session 5 batch 2:
| Page | Notes |
|------|-------|
| GGX / API Integration | 3 API keys w/ masked values, Copy/Revoke, Docs card (blue), Webhooks card, 4-col usage stats |
| GGX / Settings | Profile form + avatar, 5 notification toggles (ON/OFF), Security fields, 2FA Enabled banner |
| GGX / States | 3-col utility page: Empty States (3), Error States (2), Loading/Skeleton States (2), Permission States (3) |

All 14 GGX screen pages are now built. Remaining polish:
- Annotate pages with red-lines / spacing notes (optional, not required yet)
- Code Connect mappings between Figma components and code components (separate task)
- Backend integration (blocked on BFF)

### Figma screens — new file (session 6): ceL7WwBQpaLl66Y7sUcgPR

Complete screen coverage across all 9 previously-empty pages. All frames are content-only (1184px), matching the existing Dashboard/Transactions convention with route + nav metadata in subtitles.

| Page | Frames |
|------|--------|
| ⬆ Bulk Upload | Step 1 (default + file selected), Step 2 Column Mapper, Step 4 Review & Confirm, Modals: Upload spinner, Background processing, Drop-off locations, Booking complete |
| 🔧 Ops Requests | List, Empty state, Detail (in review), Detail (declined), Dialog: category select, supply fields, pickup support fields, success |
| ⚠ Claims/SLA/Support | Claims list, Claim detail (in review + denied), SLA Alerts list, Support Tickets list, New ticket form, Ticket detail with thread |
| 📈 Analytics & Reports | Data Analytics (main + subaccount scoped), Reports list + generate form |
| 💰 Finance | Earnings + Settlement Detail, Billing Statement + Pay Now modal, Payment Settings |
| 👥 Account Management | Subaccounts (not enabled, active, enable intro, enable confirm, enable success, request form, request success), Users & Permissions, Address Book, Settings, Notifications, Invite dialog |
| ⚙ System | API Integration (main, regenerate confirm) |
| 🔐 Auth / Public | Login, Public Tracking (empty, result, not found) |
| 🧩 Role Variants | In-app notifications panel |

**Visual audit + fixes applied (session 6):**
- Ops Requests Detail + Claims Detail: status timelines rebuilt with correct card-relative coords; detail row gaps compacted
- Data Analytics: Monthly Volume bar chart + SLA Performance bars rebuilt with correct card-relative coords
- Ops Requests Stat Cards: corrected values (4, 3, 2)
- Bulk Upload Step 1: button labels + badge text fixed (wrong component property pattern used on initial build)

**GGX-SHADCN file cleanup:** 9 incorrectly-added GGX screen pages removed from `9zwtAL4RU3Y8WVRJAsSulX`. Design system file is clean.

### Figma audit + fixes (session 7) — App Screens file `ceL7WwBQpaLl66Y7sUcgPR`

Full code-vs-Figma accuracy audit completed. Match: High, Completeness: Medium-High. Key finding: two fully-built routes had no Figma screen, and several App-Shell interactive states existed in code but were mislabeled "future" in the Gap Log.

**Critical fixes applied + visually validated (all 4 done):**
- **Service Advisories** (`/dashboard/advisories`) → page *Operations — Claims / SLA / Support*: `List` + `Empty State`
- **Subaccount Settings** (`/dashboard/subaccounts/:id/settings`) → page *Account Management*: `Main`, `Edit Managers`, `Not Found`
- **App Shell** → page *App Shell*: `Account Menu Dropdown`, `Switch Account Modal`, `Topbar Search — Results`, `Topbar Search — No Results`, `Account Switcher Panel`
- **Bulk Upload Summary** → page *Operations — Bulk Upload*: `Error Rows` (editable error table, per-field red states, duplicate trash, retry banner, 17-col scroll note) + `All Fixed`
- **Gap Log** updated with dated audit-pass section.

**DS publishing:** `SearchInput`, `SegmentedControl`, `StatCard`, `AddressDisplayCard` are now PUBLISHED to the GGX-SHADCN team library (user did this manually 2026-06-02) — they can now be imported as instances in the App Screens file.

**Remaining (Important tier — NOT yet built):**
- ~~Users & Permissions edit-permissions form; Address add/edit form~~ — done (session 8)
- ~~Empty states: SLA Alerts, Address Book, Notification dropdown~~ — done (session 8)
- ~~Extra status variants for Transaction/Claim/Ticket detail~~ — Claim Settled + Ticket Resolved done (session 8)
- (Nice-to-have) create `StatusTimeline`, `BatchRow`, vibrant `KpiCard` in GGX-SHADCN; logo placeholder, unbound icon fills, tabler/selector placeholder, Notifications badge

**Convention note:** App Screens frames are hand-built with hardcoded values mirroring the app's Tailwind classes (Inter font); Button is the main component instance used. Now that the 4 custom components are published, new frames can use real instances where they fit.

### Figma Important-tier build (session 8) — App Screens file `ceL7WwBQpaLl66Y7sUcgPR`

All Important-tier items built and visually validated. New frames:

| Page | Frame | Node |
|------|-------|------|
| 👥 Account Management | Address Book / Add-Edit Form | `133:46` |
| 👥 Account Management | Users / Dialog — Edit Permissions | `135:46` |
| 👥 Account Management | Address Book / Empty State | `138:46` |
| ⚠ Claims / SLA / Support | SLA Alerts / Empty State | `141:16` |
| ⚠ Claims / SLA / Support | Claims / Detail — Settled | `148:16` |
| ⚠ Claims / SLA / Support | Support Ticket Detail / Resolved | `148:73` |
| 🧩 Role & Account Variants | In-App Notifications Panel — Empty | `143:2` |

- Detail variants (Settled / Resolved) were cloned from the existing In Review / Open frames, then re-statused (badge colors, timeline completion, refund/status text, action button).
- Gap Log page (`27:221`) updated with a dated session-8 section.
- Build gotcha logged: icon circles created as auto-layout frames collapse to pills (HUG overrides `resize`); set `primaryAxisSizingMode`/`counterAxisSizingMode` to `FIXED` and resize after `layoutMode`.

---

## Latest commits

```
0648738 refactor: replace inline icon container divs with IconContainer component
ace5da5 feat: IconContainer component, Button iconEnd prop, dashboard context banners, sidebar + Transactions polish
299b5cc feat: Operations Requests detail page
ff42e2c feat: Data Analytics subaccount scoping via dataAnalyticsService
29223d6 docs: checkpoint — Operations Requests complete, all polish-pass items done
3035a42 chore: add gh pr and PowerShell PATH search to allowed tools
1358d39 fix: operations requests sidebar access and context E default address
2a1d85c fix: operations request account context flow
2c9d9a4 docs: update session state — Ops Requests fully polished, Figma design system complete
```

---

## Important decisions

- Auth uses sync localStorage init — intentional shortcut, revisit with real backend.
- Dashboard KPI numbers reflect the 25-transaction seed, not business-scale projections.
- `data/bulkTemplate`, `data/dropoffLocations` are intentionally not wrapped in services (frontend config).
- `reportedCounts` on `TransactionBatch` is a stand-in for backend-provided batch aggregates.
- Manager subaccount is resolved via `user.accountName` string match — needs canonical `subaccountId` on the user object when real auth lands.
- `getPreferredAddress()` returns static seed data — replace with an API call when addresses are backend-served.
- Dashboard and Earnings use vibrant full-card color backgrounds by design (primary summary pages). All other stat cards use the white `StatCard` pattern.
- Operations Requests must be available for Admin (main view, scoped view) and Manager contexts. It should not be gated behind "subaccounts disabled."

---

## Remaining tasks

Per `docs/roadmap.md`. Suggested priority order:

1. **Service-layer / backend integration** (roadmap active priority — blocked on BFF existing)
   - Swap each service's mock body for real `fetch()` calls against the BFF
   - Starting point: auth (async session hydration — sync localStorage is known tech debt)
   - Dependency order: auth → transactions + claims → everything else
   - No frontend work to do here until a backend/BFF is available

2. ~~**Operations Requests detail page**~~ — done (`/dashboard/operations-requests/:id`)

3. **Minor remaining responsive polish** (low priority)
   - SLA alert row badge wrapping in narrow widths (currently wraps via flex-wrap, may be acceptable)
   - General badge overflow in constrained table cells

---

## Known issues / risks

- **Auth hydration is synchronous** (localStorage read) — will need async handling + loading state when real auth lands.
- **Bundle size warning** (main chunk ~700 kB) — pre-existing, not blocking.
- **SLA alert seed data** references tracking numbers from the original 10-transaction set; some may not match the expanded 25-transaction seed.
- **`reportedCounts` mismatch**: seeded batch counts (e.g. 312 total) don't match the 2–3 visible mock transactions in the expanded view. Expected mock limitation, not a bug.
- **`getPreferredAddress()`** returns a static seed record — will not reflect user-created addresses until an address service is wired up.
- **Manager `user.accountName` matching** is a string comparison against `SubAccount.name`. Fragile against name changes. Replace with canonical `subaccountId` on the user object when real backend auth lands.

---

## Suggested next prompt

> "Build the Nice-to-have Figma items in the GGX-SHADCN design system file (`9zwtAL4RU3Y8WVRJAsSulX`): create `StatusTimeline`, `BatchRow`, and a vibrant `KpiCard` component, plus a logo placeholder and fix unbound icon fills. The Critical + Important tiers are complete (sessions 7–8). See the 'Figma Important-tier build (session 8)' section above." — or pivot to service-layer/backend integration once a BFF exists.

---

_Last updated: 2026-06-02 (session 8 — Figma Important-tier build: forms, empty states, detail status variants)_
