# Session State - GGX Corporate

> Lightweight resume/checkpoint file. Detailed June 2026 history was archived to
> `docs/archive/session_log_2026-06.md`.

## Current State - Updated 2026-06-14

- **Stage:** Basic User experience is now fully self-contained under `/basic/*` —
  no everyday CTA opens Business+ `/dashboard` chrome, booking has a real
  review/confirmation step, and Store stubs are intentional.
- **Branch:** `feature/customer-segment-growth-demo`.
- **Build/typecheck status:** green (`npm run typecheck` + `npm run build`
  verified after the Basic-native pages pass).
- **Push status:** not pushed in this pass (commit pending; push only when asked).
- **Working tree note:** `.claude/settings.local.json` is local config; leave it
  alone unless explicitly asked. QA scripts/dirs are gitignored locally.

## Most Recent Product Truth

- Account Add-ons and Integrations IA are decided. Account Add-ons lives under
  Account Management; Integrations stay separate.
- In-app Spreadsheet remains a secondary path under Bulk Upload; it has no sidebar
  item and is not a separate product.
- Inventory product attachment is grid-only for bulk booking. It uses the product
  picker when Inventory is enabled and does not deduct or reserve stock.
- Storefront now has demo checkout surfaces from later sessions: direct product
  checkout, session cart, cart review, and cart checkout. Real order placement,
  cart persistence, stock deduction/reservation, and final fee/payment contracts
  remain backend-owned.
- Item Protection: the spreadsheet fee preview shows a frontend estimate
  (`max(declaredValue − 500, 0) × 1%`) as a conditional line item when any valid
  row has a declared value above ₱500. The booking confirmation dialog rolls it
  into the estimated total (not broken out separately). Authoritative Item
  Protection fee contract and location-based delivery rate computation remain
  deferred to backend/BFF integration.

- Custom Reports gating is done and the current UX flow is acceptable for now.
  Saved templates and scheduled exports remain deferred/backend-owned.
- Custom Reports now respects account context: the Subaccount column/filter only
  appears for Main Account view with Subaccounts enabled; On-Demand options and
  rows are hidden when On-Demand is not enabled for the active scope; templates
  are sanitized so unavailable columns/options cannot be reintroduced; CSV export
  matches applicable visible columns; and Subaccount filtering prefers canonical
  ID filtering.

## Most Recent Feature Work — Basic User Demo

- Route group `/basic` added as a standalone mobile-first demo layer (no auth
  gate, no Business+ sidebar). Entry point: `/basic`.
- `BasicLayout` — light blue app shell, GGX logo header (no "Basic" branding),
  5-tab bottom nav (Home / Rewards / Ship / Transactions / Account).
- `BasicDashboard` — GGX app-aligned: bold welcome, service tiles (2×2 large),
  horizontal Explore-more row, activity card (COD + shipment stats), recent
  orders below fold.
- `GrowingNudgeCard` — promo-banner style matching GGX app carousel: gradient
  left panel + star icon + bold text + CTA link + pagination dots.
- `HVMNudge` page — "You may qualify for special business pricing" with benefit
  list, 3-step process, Request review and Talk to Sales CTAs with demo success
  states.
- `BasicSegmentContext` — `basic | growing` demo-only state (default: `growing`
  so nudge shows on first load). Change default in context to demo `basic` state.
- No auth gate, no backend calls — all mock/static. Safe to remove the whole
  `/basic` route group without touching Business+ dashboard.

### Refinement pass (aligned to `basic_user_requirements.md`)

- **Same-Day Delivery is no longer a default Basic service.** Removed it from the
  home service tiles and from the booking-flow default. In `BasicDeliver` it is
  shown as an eligibility-gated row that routes to the Growing nudge
  (`/basic/qualify`) instead of being bookable. Matches the doc rule: SDD is an
  enabled-only capability, surfaced as a Growing → HVM nudge.
- **"Prepaid Packs" / "Sulit Bundles" standalone framing removed.** The doc treats
  packs as booking-measurement only. Home tiles now lead with the free Basic
  toolkit (Standard Delivery, Bulk Upload [Free], Sell Online, Track Order);
  Save & Earn now surfaces Vouchers, buyer Promo Codes, and a Volume-Pricing
  Growing nudge (→ `/basic/qualify`).
- **Desktop responsiveness:** `BasicLayout` now centers the app shell in a
  phone-width frame (`max-w-[480px]`) on tablet/desktop with a neutral backdrop;
  bottom nav is pinned to that frame. Mobile (375px) layout is unchanged.
- **Branding:** softened the account "GGX Basic" badge/footer to normal GGX
  branding ("Basic" plan label; "GoGo Xpress · Basic account"). Header already
  used the GoGo Xpress logo.
- Growing remains a nudge-only layer (segment context default `growing`); no new
  feature tier. Business+ `/dashboard` routes and public surfaces
  (`/track`, `/shop`, `/buy`, `/checkout`) untouched.

### Basic-native deep pages (keep sellers inside BasicLayout)

- New routes under `/basic/*`, all rendered inside `BasicLayout` (mobile-first,
  375px; phone-width frame on desktop). No auth gate, all mock/static:
  - `orders` + `orders/:id` — bookings/transaction history with quick filters,
    status timeline, COD summary, track + get-help actions.
  - `bulk` — Bulk Upload (Free) with dropzone, template download, recent batches.
  - `store` — Sell Online hub: storefront card, stats, Inventory / Promo Codes /
    Connect Shopify (Shopify folded in here — no `/dashboard/shopify` link).
  - `inventory` — product list with stock badges (stock is reference-only, not
    reserved/deducted — matches product rules).
  - `earnings` — payout summary (available / processing / collected), payout
    history, **payout bank enrollment + management dialog**. No contract billing
    or enterprise finance controls.
  - `support` — live chat / call / help topics / tickets.
  - `settings` — profile, address book, payout account, security, notification
    toggles. No enterprise/role controls.
  - `same-day` — Same-Day **sales/lead handoff** page (hero, highlights, lead
    form, "Request Same-Day access" / "Get in touch with Sales", success state).
    Same-Day is NOT bookable in Basic.
- Shared mock data in `pages/basic/basicMockData.ts` (orders list ↔ detail).
- All Basic deep CTAs (home tiles, Explore, Save & Earn, Account, bottom-nav
  "Orders") now point to `/basic/*`. Bottom nav tab renamed Transactions → Orders.
- Booking "Same-Day" option in `BasicDeliver` now routes to `/basic/same-day`
  (was `/basic/qualify`). Account screen no longer links into `/dashboard`.
- Intentional cross-over kept: `HVMNudge` ("Preview / Explore GGX Business+")
  still links to `/dashboard` — it is the dedicated upgrade/qualification context
  where showing the upgrade target is the point. Everyday Basic stays in `/basic`.

### Polish pass — fully self-contained Basic

- **No more Basic → `/dashboard` crossover.** `HVMNudge` "Explore / Preview
  Business+" links now point to a new Basic-native page `BasicBusinessPreview`
  (`/basic/business-preview`): a showcase of what Business+ offers (special
  pricing, Same-Day/on-demand, priority support, contracted billing) framed as a
  nudge/lead-capture; CTAs hand off to `/basic/qualify`. It is NOT a tier
  dashboard. Only a descriptive code comment now mentions `/dashboard`.
- **Basic booking now has a real review step.** `BasicDeliver` is controlled
  (recipient/contact/address/COD) and adds a rider-pickup vs drop-off choice;
  "Review booking" routes to `BasicBookingReview` (`/basic/deliver/review`) via
  navigation state. Review shows service type, handoff, delivery summary,
  payment/fees (estimated, frontend-only), and a Confirm CTA that routes to an
  order detail. Standard stays default; Same-Day still not bookable.
- **Store stubs are intentional.** `BasicStore` Promo Codes ("Coming soon") and
  Connect Shopify ("Express interest") now open a small in-page dialog with a
  notify/express-interest acknowledgement instead of self-routing. They never
  touch `/dashboard`.
- New page titles in `BasicLayout`: "GGX Business+", "Review Booking".

## Most Recent Feature Work — Bulk Upload field-name unification (2026-06-15)

- **Single source of truth for field labels:** `BULK_FIELD_LABELS` in
  `data/bulkTemplate.ts` is now consumed by the column mapper (`BulkColumnMapper`),
  the in-app spreadsheet grid (`BOOKING_COLUMNS` in `lib/bookingValidation`), the
  failed-orders retry table (`BulkUploadSummary`), and the download template. Same
  field → same name everywhere (Name, Mobile, City / Municipality, Declared Item
  Value, Insure full item value?, Recipient Pays Fees; Landmarks / Promo Code /
  Reference ID carry "(Optional)").
- **Consistent required/optional treatment:** removed red asterisks from the
  spreadsheet grid and failed-orders headers; optional fields are marked only by
  "(Optional)". Grid required flags follow the model, with two intentional
  exceptions: **COD Amount** is conditionally required (only when COD = Yes), and
  **Item Name** (grid `productSku`) is satisfied by attached Inventory products.
- **Item Protection Fee** is no longer a template/mappable field — it remains only
  as a derived, read-only display in the failed-orders table fee column.
- **Mapper aliases** keep older uploaded headers auto-mapping (Recipient Name,
  Mobile Number, City/Municipality, Declared Value, Item Protection, Promo code,
  Ref ID, etc.). The `MOCK_CUSTOM_HEADERS` in `BulkUploader` intentionally keep
  old/varied names to exercise aliasing.
- Build/typecheck green. Not pushed.

## Most Recent Feature Work — Saved mapping scope + Order attribution (2026-06-15)

- **Saved column-mapping templates are scope-aware (mock).**
  `lib/columnMappingTemplates` keys templates by header signature **and**
  `scopeAccountId`; `findTemplateForHeaders(headers, scopeAccountId)` prefers the
  active scope's own templates, then account-level `shared` ones. `BulkColumnMapper`
  takes `scopeAccountId` (passed from `BulkUploader` via `uploadAccount.accountId`),
  restores a matching saved mapping on load (banner + "Use auto-match instead"),
  and upserts on Confirm. Real cross-account sharing UI + backend persistence
  remain deferred.
- **Order attribution model (mock).** `OrderAttribution` on transactions
  (accountScope, sourceType, bookingMethod, connectedStore, integrationId,
  createdBy). Helpers/labels: `SOURCE_TYPE_LABEL`, `BOOKING_METHOD_LABEL`,
  `bookingMethodGroup` (both bulk methods → `bulk_upload`).
  - Transactions list: short **Source** column + **Source filter**; Subaccount
    column is ownership-only (the old "- Shopify" concatenation was removed).
  - Transaction detail: "Order Source & Attribution" card.
  - Custom Reports: selectable + exportable **Source** column.
  - Seeded GoBenta (Storefront Checkout) + Product Checkout (Single Product
    Checkout) demo rows and a created-by example.
  - Still pending: analytics breakdowns by source/booking-method, and the
    dedicated Storefront-vs-Product-checkout analytics split.
- Build/typecheck green. Not pushed.

## Most Recent Feature Work — On-Demand Delivery MVP (2026-06-15)

Premise: the order already exists before OD booking; delivery mode/quote may be
set outside the app; no full quote/estimate flow yet. On-Demand is an Account
Add-on that unlocks OD booking + OD transaction visibility.

- **Add-on gating (already in place, verified).** `on_demand` is a subaccount-
  scoped `FeatureId` in `data/featureEnablement.ts`, seeded enabled only for
  `acme-luzon`; all other scopes default off and discover it in Account Add-ons.
  Both Bulk Upload paths (`BulkUploader`, `BulkSpreadsheet`) gate the On-Demand
  service-mode button: locked copy now reads "Immediate, direct pickup &
  delivery — enable in Add-ons" and routes to `/dashboard/account-add-ons`;
  selectable + bookable when enabled.
- **Transactions list (already in place).** Single violet On-Demand service badge
  (Standard = blue, Same-Day = orange, On-Demand = violet) + Service Type filter.
- **NEW — OD progress model.** `getOnDemandProgress()` + `ON_DEMAND_STAGES` in
  `data/transactions.ts` (re-exported via `transactionService`). Courier-style
  stages: Booking confirmed → Looking for driver → Driver assigned → Picked up →
  En route → Delivered, with a mocked ETA + failed/returned exception state.
  Demo/presentation only (dispatch/ETA are backend-owned).
- **NEW — shared `OnDemandTracker` component** (`components/OnDemandTracker.tsx`):
  `OnDemandBadge`, `OnDemandMapPlaceholder` (placeholder live map, no real map
  integration), `OnDemandRoute` (pickup/drop-off), `OnDemandTimeline` (stepper).
  Reused by both the detail page and public tracking for visual consistency.
- **NEW — Transaction detail OD section** (`TransactionDetails.tsx`): shown only
  when `serviceType === 'on_demand'`. Map placeholder, pickup/delivery addresses,
  current status + ETA, progress timeline, CTAs: Track live delivery (opens
  `/track/:id`), Contact support (reuses report modal), Cancel booking (reuses
  `claimsService` cancel; enabled only for `pending`, mocked).
- **NEW — public `/track` OD state** (`TrackingPage.tsx`): OD tracking numbers
  render `OnDemandTrackingResult` (status hero, placeholder map, route cards,
  timeline, support CTA) instead of the standard result. No buyer app required.
- **NEW — seed row** `GGX-2026-90011` (pending On-Demand, Acme Luzon) so the
  early-stage progress + cancel-before-pickup CTA are demoable.
- **Intentional boundary:** booking still records to Bulk Upload history (mock);
  the Transactions list reads the static transaction seed, same as Standard/
  Same-Day. No live append-to-transactions store was added (would touch non-OD
  flows). OD is demonstrated across all surfaces via the seed.
- Build + typecheck green. Not pushed.

## Current Priority

Backend integration remains the next major app stage:

1. Auth/session hydration.
2. Transactions and claims.
3. Everything else.

Swap mock service bodies for real BFF/fetch integration only as the final
production stage, after a BFF exists.

## Standing Constraints

- Keep the product bulk-first.
- Preserve Main Account/Subaccount/Manager scoping.
- Use GGX SHADCN/shared components and tokens first.
- Preserve Upload File behavior when touching spreadsheet booking.
- No new dependencies without explicit approval.
- No destructive git actions.
- Commit stable milestones; do not push unless explicitly asked.

## Documentation Risks

- The exact checkout route set and persistence details are documented from session
  notes, not re-verified against source during this Markdown-only cleanup.
- Some historical Figma notes remain archived and may not reflect current app
  state.
- Real BFF endpoint shapes are still provisional until backend contracts exist.
