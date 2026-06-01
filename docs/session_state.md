# Session State — GGX Corporate

> Lightweight handoff file. Update at natural checkpoints during long or complex work.
> On session start: read this file silently, then confirm to the user what you're resuming.

---

## Current goal

All polish-pass roadmap items (1–4), Operations Requests (item 5), and Data Analytics subaccount scoping are complete. The service-layer migration is also complete (all non-config UI consumers go through service facades; intentional exceptions documented). The next stage is service-layer / backend integration — swapping mock service bodies for real `fetch()` calls against the BFF. This requires an actual backend to exist before meaningful work can proceed.

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

### Stat card alignment
- Secondary pages use `StatCard`: SLA Alerts, Support Tickets, Reports, Billing Statements, Operations Requests
- Dashboard and Earnings keep vibrant colored-background cards (intentional primary treatment)

### Figma design system (GGX-SHADCN)
New pages added in this session:
- Segmented Control (Active=First / Active=Second)
- Stat Card (7 color variants)
- Search Input (Empty / Filled / Focused)
- Address Display Card (4 label variants + Compact Address Card section)

---

## Latest commits

```
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

2. **Operations Requests detail page** (natural follow-on, not on current roadmap)
   - `/dashboard/operations-requests/:id` showing request status timeline

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

> "Resume from session state. The frontend is feature-complete and all polish-pass items are done. Next: either implement the Operations Requests detail page (`/dashboard/operations-requests/:id`), or begin backend integration if a BFF is available."

---

_Last updated: 2026-06-01 (session 2)_
