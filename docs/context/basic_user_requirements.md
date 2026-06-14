# Basic User Requirements

Product requirements for the **Basic** self-serve seller/merchant experience.

> Reference basis: a product behavior review of the current GGX seller app was
> used to extract journeys and business rules. This document captures **product
> behavior, business rules, and feature requirements only**. It is not a
> migration plan and intentionally excludes current-app architecture, technical
> implementation, or code-level detail.

Read this with `context/current-state.md` for standing constraints and
`context/commerce-workflows.md` / `context/bulk-booking.md` for related
commerce and bulk detail.

---

## 1. Basic User Product Definition

**Basic is the self-serve seller/merchant product.** It gives individual sellers
and small merchants a free-to-start logistics and lightweight commerce toolkit
they can operate without sales assistance, onboarding contracts, or account
management.

Basic is **not** "one-off consumer booking" and is **not** a stripped consumer
mode. A Basic user is a seller who ships repeatedly, may sell products online,
and manages their own orders, earnings, and customers.

Basic serves two audiences:

- **The seller** (authenticated): books deliveries, manages products, tracks
  orders, views earnings.
- **The seller's own buyers** (public, no login): track a shipment, pay a
  checkout link, browse the seller's storefront, rate a completed delivery.

Basic includes, all free to use unless noted:

- Standard delivery booking
- Bulk upload (free)
- Tracking (seller and public buyer views)
- Transactions / order history
- Earnings / COD disbursements
- Address book
- Storefront + inventory (free)
- Shopify integration (free)
- Promo codes for storefront buyers
- Merchant dashboard / performance
- Vouchers / promos
- Packs / packaging, only where relevant to booking measurement
- Drop-off / PUDO, where available
- Support / help
- Mobile-first usage throughout

**Default posture:** logistics is free to use; commerce tools are free to use;
nothing in Basic requires a contract or a sales conversation to start.

---

## 2. Segment Model: Basic vs Growing vs HVM / Business+

| Segment | What it is | How it is reached |
|---|---|---|
| **Basic** | Self-serve seller/merchant product with free logistics and lightweight commerce tools. The full seller toolkit lives here. | Default for any self-serve seller. |
| **Growing** | A usage-maturity / lead-qualification **state layered on top of Basic** — not a separate tier or feature set. | Triggered automatically by Basic usage signals. |
| **HVM / Business+** | Sales-assisted or contracted account state with negotiated terms and advanced operations. | Only after Sales/BD contact or contract setup. |

**Key rule: Growing is not a separate seller-tools tier.** Storefront,
inventory, Shopify, promo codes, bulk upload, merchant dashboard, and earnings
are **already part of Basic**. Growing does not unlock a new dashboard or a new
core feature set. Growing mainly **adds nudges and CTAs** on top of the existing
Basic experience.

Growing is triggered when a Basic user shows:

- Higher shipment volume
- Repeat selling activity
- Urgent or on-demand delivery needs
- Same-Day Delivery interest
- Possible HVM potential
- Possible need for special / negotiated pricing

Growing nudges may include:

- Tier elevation messaging
- Exclusive tier / perks visibility
- Special pricing interest CTA
- Same-Day Delivery / urgent delivery interest CTA
- Sales / BD contact CTA
- HVM qualification prompts

**HVM / Business+** state is entered **only after** Sales/BD or contract setup,
and only then unlocks:

- Negotiated pricing
- Same-Day Delivery / on-demand access approval
- Billing arrangements
- Advanced operational support
- More complex account setup
- Subaccounts / parent-account controls, if applicable later

---

## 3. Primary Basic User Journeys

**A. Book a standard delivery**
Sign in → choose Book a Delivery → set pickup address (or choose drop-off where
available) → set delivery address → enter item details (weight/size, optional
item protection) → see estimated fees and estimated pickup/delivery dates →
apply any promo → choose payment option → confirm and book.

**B. Bulk upload many shipments (free)**
Choose Bulk Upload → upload the spreadsheet → file is processed → review a
per-batch summary with per-row results → manage batches and their statuses.

**C. Track a shipment**
- Seller: open a transaction → see status timeline.
- Buyer (public, no login): open a shared tracking link → see status timeline and,
  where available, a live rider map.

**D. Review orders and history**
Open Transactions → filter by status (quick filters and full status filters) →
open an order for detail → print waybills where eligible → rebook eligible orders
→ handle items pending approval.

**E. See earnings / get paid**
Open Earnings → view COD/earnings, disbursable balance, and items for processing
→ set up or update bank details to enable disbursement.

**F. Sell online (commerce, free)**
Add products → build a storefront → share the storefront / checkout links →
optionally connect Shopify → create promo codes for buyers → view merchant
dashboard / performance.

**G. Manage account essentials**
Maintain the address book (preferred pickup, saved addresses) → manage profile
and bank details → get help via support channels.

**H. Growth moment (Growing state)**
While using Basic, a high-volume or on-demand-interested seller is shown
contextual nudges (special pricing interest, Same-Day interest, talk-to-Sales),
without losing or gating any Basic feature.

---

## 4. Core Basic Feature Requirements

**Standard delivery booking**
- Pickup, delivery, item details, fee estimate, estimated dates, promo, payment,
  confirm.
- Support a **drop-off / PUDO** branch where available (vs rider pickup).
- Show an estimated total before booking; final authoritative fees come from the
  service/backend.

**Bulk upload (free)**
- Spreadsheet upload that produces an asynchronous, per-batch result with per-row
  validation feedback and a summary view.
- Available to Basic users at no cost.

**Tracking**
- Seller-facing tracking from transactions.
- Public buyer-facing tracking by tracking number, including live rider map where
  available.
- A consistent shipment status taxonomy with friendly, customer-facing labels and
  grouped quick filters (e.g. Pending, Booked, On the way, Delivered, Returns &
  Cancellations).

**Transactions / order history**
- Filterable list + detail.
- Waybill printing for eligible statuses.
- Rebooking for eligible orders; a "pending approval" path for orders that need it.

**Earnings / COD disbursements**
- View earnings, disbursable balances, and items for processing.
- Bank details required to receive disbursements.

**Address book**
- Save, edit, and delete pickup/delivery addresses; mark a preferred address that
  auto-fills booking.
- Structured PH address (province → city → district + line + location) feeding
  serviceability and pricing.

**Storefront + inventory (free)**
- Build a storefront, list products, and let buyers browse and check out.
- Inventory management for listed products.

**Shopify (free)**
- Connect a Shopify store as a selling channel at no cost.

**Promo codes for storefront buyers**
- Sellers can create discount codes for their own buyers (buyer-facing promos).

**Merchant dashboard / performance**
- Seller-facing performance view for their commerce activity.

**Vouchers / promos**
- Buyer-applied promo codes at checkout (validated, discount shown).
- Seller-created promo codes (see above).
- One-time welcome-code style promos.
- Keep these conceptually distinct to avoid overlapping "promo" meanings.

**Packs / packaging**
- Only as a packaging/receptacle-size selection inside booking that affects
  measurement and chargeable weight. Not a standalone "buy packaging" product in
  Basic.

**Drop-off / PUDO**
- Drop-off option inside booking (closest-hub based) where the account/area
  supports it. Not a standalone location-directory feature in Basic.

**Support / help**
- Self-serve help links plus live chat / messaging support.

---

## 5. Business Rules to Preserve

- **Free-to-use core:** logistics booking, bulk upload, storefront, inventory, and
  Shopify are free to Basic users. Do not gate them behind payment or contracts.
- **Estimates vs authoritative values:** booking shows estimated fees and estimated
  dates; **authoritative rates, fees, surcharges, item-protection pricing, and
  delivery-date computation are service/backend-owned**, not frontend-computed.
- **Two-audience model:** seller (authenticated) and the seller's buyers (public,
  no login) are both first-class. Public surfaces (tracking, checkout link,
  storefront, rating) must work without an account.
- **Serviceability gating:** if a pickup location is out of the serviceable zone,
  booking must surface that clearly and block accordingly.
- **Account-state gating:** suspended, blocked/blacklisted, or disbursement-blocked
  accounts must be surfaced with the appropriate blocking notice and cannot proceed
  with affected actions.
- **Bank/disbursement readiness:** disbursements depend on valid bank details and
  account standing; prompt the seller to complete or update bank details when
  required.
- **Status taxonomy:** maintain a single, consistent shipment-status vocabulary with
  customer-facing labels and terminal-state handling (no further attempts on
  failed/terminal states).
- **Promo correctness:** promo validity, discount amount, and eligibility are
  backend-validated; the frontend only requests and displays results.
- **Rebooking / pending approval:** eligibility for rebooking and the
  pending-approval path is rule-driven and backend-owned.
- **PH market assumptions:** address hierarchy, holidays, and serviceability are
  Philippines-based for now.
- **Profile completeness:** a usable seller account needs core identity details
  (name + mobile) before full access; treat incomplete profiles accordingly.
- **Growing never removes features:** entering Growing only adds nudges; it must not
  hide, gate, or downgrade any Basic capability.

---

## 6. Conditional Logic Needed

Basic behavior is **config-driven**: the same screen can render differently for two
sellers depending on their account configuration, entitlements, pricing setup, and
service availability. Treat the following as **product/business rules**, not
implementation details. Exact values and ownership are backend-defined.

- **Feature availability per account:** which capabilities a seller sees (book a
  delivery, sell a product, bulk upload, Shopify, storefront, merchant
  performance) can vary by account entitlement. Basic's default should expose the
  free seller toolkit; surface a feature only when the account is entitled to it.
- **Pricing model per account:** weight measurement can be dimensional-weight or
  flat-weight depending on account pricing config; the booking measurement UX must
  follow the account's pricing model. Custom-rate accounts may see different
  bundle/pricing offers.
- **Same-Day Delivery availability:** SDD is a gated capability, available only when
  enabled for the account (see §7 — generally a Growing/HVM outcome, not a default
  Basic feature).
- **Drop-off / PUDO availability:** offered only where the account/area supports it.
- **Payment options:** available payment methods can vary by account billing/pricing
  configuration.
- **Account-state branches:** suspended, blocked, out-of-zone, and
  disbursement-not-ready states each change what the seller can do.
- **Onboarding / nudge state:** tutorials, banners, welcome-code eligibility, and
  Growing nudges are driven by usage and profile signals (e.g. first booking, first
  successful transaction, volume, repeat selling).
- **Platform context:** mobile/native vs web context can affect availability of some
  surfaces.

> Documentation note: because so much Basic behavior depends on account
> configuration, pricing config, service availability, and account state, the
> authoritative rule set lives in backend/service contracts. Keep these as product
> rules here and confirm specifics with product/backend owners (see §9).

---

## 7. Free Included Tools vs Growth Nudges vs Contracted / HVM Features

**Free, included in Basic (default seller toolkit):**

- Standard delivery booking
- Bulk upload
- Tracking (seller + public buyer)
- Transactions / order history
- Earnings / COD disbursements
- Address book
- Storefront + inventory
- Shopify
- Buyer-facing promo codes
- Merchant dashboard / performance
- Vouchers / promos (buyer-applied, seller-created, welcome)
- Packs / packaging (booking measurement only)
- Drop-off / PUDO where available
- Support / help

**Growth nudges (Growing state — CTAs only, no new feature set):**

- Tier elevation messaging
- Exclusive tier / perks visibility
- Special / negotiated pricing interest CTA
- Same-Day Delivery / urgent delivery interest CTA
- Sales / BD contact CTA
- HVM qualification prompts

**Contracted / HVM / Business+ (only after Sales/BD or contract setup):**

- Negotiated pricing
- Same-Day Delivery / on-demand access approval
- Billing arrangements
- Advanced operational support
- More complex account setup
- Subaccounts / parent-account controls (if applicable later)

**Excluded / hidden for now (do not build into the Basic experience):**

- **Messenger Shop** — discontinued unless revived later.
- Contract billing workflows.
- Enterprise-style account controls.
- Business+ / HVM-specific flows inside Basic.

---

## 8. Mobile UX Priorities

Basic is **mobile-first**. Sellers operate primarily on phones.

- Booking, bulk upload review, tracking, transactions, and earnings must be fully
  usable on small screens.
- Primary actions (Book a Delivery, Sell a Product, view orders/earnings) should be
  reachable from a mobile home/nav with minimal taps.
- Public buyer surfaces (tracking, checkout link, storefront, rating) must be clean
  and fast on mobile, since buyers open them from shared links.
- Keep booking steps and forms thumb-friendly; preserve in-progress state and warn
  before accidental exit mid-booking.
- Status timelines and quick filters should read clearly on mobile.
- Growth nudges should be contextual and non-blocking on mobile — they must not
  obstruct core seller tasks.

---

## 9. Open Questions

1. **Same-Day Delivery placement:** Is SDD strictly an HVM/contracted outcome, or
   can selected Basic accounts be enabled for it? Should SDD ever appear as a
   single-parcel flow in Basic, or stay an enabled-only capability?
2. **Growing thresholds:** What concrete usage signals (volume, frequency, value)
   move a seller into the Growing state, and which nudges fire for each signal?
3. **Pricing config exposure:** How should dimensional vs flat weight, custom rates,
   and payment-option differences be communicated to Basic sellers without exposing
   internal config?
4. **Feature entitlement defaults:** What is the default free toolkit for a brand-new
   Basic seller, and which capabilities (if any) require enablement?
5. **Promo model:** Should buyer-applied promos, seller-created codes, and welcome
   codes be unified into one promotions model for Basic, or kept separate?
6. **Drop-off / PUDO:** Is there a buyer/seller-facing drop-off location directory in
   scope for Basic, or is drop-off always "closest hub" at booking time?
7. **Packs / packaging:** Does Basic need a true "buy packaging" feature, or is the
   booking receptacle-size picker sufficient?
8. **Rebooking / pending approval:** What are the exact eligibility rules and limits
   for rebooking and the pending-approval path in Basic?
9. **Earnings / disbursement:** What are payout cadence, minimum thresholds, and the
   "for processing" lifecycle for Basic sellers?
10. **Subaccounts:** Confirm subaccounts/parent controls are strictly HVM/Business+
    and never surface in Basic.

---

## Feature Decision Table

| Feature | Basic Decision | Required Rules | Growth / HVM Notes | Priority |
|---|---|---|---|---|
| Standard delivery booking | Include, free | Estimates shown; authoritative fees/dates backend-owned; serviceability gating | Negotiated pricing is HVM only | High |
| Bulk upload | Include, free | Async per-batch + per-row results | Higher volume is a Growing signal | High |
| Tracking (seller + public) | Include, free | Consistent status taxonomy; public works without login | — | High |
| Transactions / order history | Include, free | Status filters; waybill print on eligible; rebooking/pending rules backend-owned | — | High |
| Earnings / COD disbursements | Include, free | Requires valid bank details + account standing | Payout terms may differ under HVM | High |
| Address book | Include, free | Preferred address auto-fills; PH hierarchy; serviceability | — | Medium |
| Storefront + inventory | Include, free | Public storefront/checkout works without login | — | High |
| Shopify | Include, free | Connect as channel at no cost | — | Medium |
| Buyer promo codes (storefront) | Include, free | Backend-validated discounts | — | Medium |
| Merchant dashboard / performance | Include, free | Seller-facing only | — | Medium |
| Vouchers / promos | Include, free | Keep buyer/seller/welcome promos distinct; backend-validated | — | Medium |
| Packs / packaging | Include only in booking | Affects measurement / chargeable weight only | — | Low |
| Drop-off / PUDO | Include where available | Closest-hub based; availability is account/area driven | — | Medium |
| Same-Day Delivery | Exclude by default | Enabled-only capability; not a default Basic feature | Growing nudge → HVM/contract approval | Medium |
| Support / help | Include, free | Self-serve links + live chat | — | Medium |
| Growth nudges | Include as CTAs | Never gate/remove Basic features | Drives Sales/BD + HVM qualification | Medium |
| Messenger Shop | Exclude / hide | Discontinued unless revived | — | — |
| Contract billing | Exclude from Basic | — | HVM/Business+ only | — |
| Subaccounts / parent controls | Exclude from Basic | — | HVM/Business+ only, if applicable later | — |
