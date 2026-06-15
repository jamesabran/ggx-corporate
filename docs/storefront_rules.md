# Storefront Rules — GGX Business+

> Simple storefront built from inventory products. Model in `data/storefront.ts`;
> access via `services/storefrontService.ts`. See `commerce_rules.md`.

## Dependency

- **Storefront requires Inventory first.** Storefront products must come from
  Inventory. If Inventory is not enabled for the scope, Storefront resolves to
  `requires_dependency` → "Enable Inventory first".

## Capabilities

> **Implemented:** profile edit, Inventory product selection, persisted
> publish/unpublish, public storefront browsing at **`/shop/:slug`**, direct demo
> product checkout, session cart, cart review, and cart checkout. Production order
> placement remains backend-owned.


- Storefront enablement (per Standard account or Subaccount scope).
- Store profile setup: store name · description · logo/banner placeholder ·
  store URL/slug · contact information.
- Product selection from Inventory.
- Direct product demo checkout and multi-product session cart/checkout.
- Allowed delivery options: **Standard Delivery · Same-Day Delivery · On-Demand
  Delivery** (On-Demand subject to coverage — see `service_type_rules.md`).
- Publish status: **Draft · Published · Unpublished**.

## Publish / unpublish rules

- A storefront can be **published and unpublished anytime**.
- Ongoing/pending transactions must be handled safely:
  - Unpublishing **hides the storefront from new customers only**.
  - Existing orders, active bookings, and in-transit deliveries **continue until
    completed**.
  - If there are **pending unpaid orders**, show a warning and require explicit
    confirmation.
  - **Never** auto-cancel existing transactions on unpublish.
- Unpublish confirmation copy:
  > "Unpublishing will hide your storefront from new customers. Existing orders
  > and active deliveries will continue until completed."

## Storefront Orders vs Delivery Transactions

> Model in `data/storefrontOrders.ts`; access via
> `services/storefrontOrdersService.ts`. Seller surface: **Store Orders tab inside
> Transactions** (order detail at `/dashboard/storefront/orders/:id`).

- A **Storefront Order** is the buyer's commerce order placed through `/shop`
  (storefront cart) or `/buy` (single-product) checkout. A **Delivery
  Transaction** is the fulfillment record. **These are separate, with separate
  status fields** — never use one field for both seller acceptance and delivery
  progress.
- **IA:** the buyer-order queue is a **Store Orders tab inside Transactions**
  (Store Orders · Deliveries), shown only when Inventory/Storefront commerce is
  enabled for the active scope — **no separate sidebar item**. Non-commerce
  accounts see Transactions as the normal deliveries page (no tabs).
- **Store Order display status** (queue) is buyer-order-centric and distinct from
  delivery status: Awaiting seller acceptance → Accepted → Preparing → Ready for
  pickup → Out for delivery → Completed (or Cancelled). The Deliveries tab shows
  delivery/fulfilment statuses only.
- **Buyer checkout** uses a 65/35 desktop layout (details/payment · order
  summary), friendly timing labels (no STD/SDD/OD), and a tabbed payment section
  (Cash/COD live; e-wallets / card / online banking present but coming soon). The
  buyer does **not** choose who pays the delivery fee — fee-payer is seller/store
  config, not a buyer control. The delivery fee (mock estimate,
  `lib/checkoutEstimates.ts`; real rates backend-owned) is added to the COD total,
  shown as "Calculated after address" until a province is entered.
- Buyer order status: `awaiting_acceptance` → `accepted` | `rejected`.
- A delivery transaction is created (revealed) **only when the seller accepts**.
  At acceptance, a tracking number is assigned and — for On-Demand — the delivery
  starts at "Looking for driver". This is the point the order is *booked*. There
  is no state where an order is both "awaiting acceptance" and "booked".
- On-Demand is offered as a buyer delivery option at checkout **only when the
  seller scope has the On-Demand add-on enabled** (`feature_enablement`), gated
  independently of the storefront's listed delivery options.
- Accepted-order deliveries are **synthesized** into the transaction surfaces
  (list / detail / public tracking resolve them by tracking number) rather than
  written into the static transaction seed.

### On-Demand delivery lifecycle (demo)

`data/onDemandDelivery.ts` owns the granular delivery stages, ETA, and rider
map position (demo/presentation; dispatch-owned in production):
Looking for driver → Driver assigned → Preparing order → Ready for rider pickup →
Handed over to rider → Picked up → En route → Delivered. The seller order detail
exposes a demo "Advance" control to walk these. The mock map
(`components/OnDemandMap.tsx`) shows pickup/drop-off pins, a rider marker that
moves with the stage, route line, ETA chip, and status chip — reused by the
seller transaction detail and the public tracking page. No real map/geolocation/
dispatch integration.

## Public tracking

- Reference can be a delivery tracking number (`GGX-…`) **or** a storefront order
  number (`SO-…`).
- Before acceptance → buyer-facing "Waiting for seller to accept your order".
- After acceptance → OD delivery progress + mock map (rider position reflects the
  stage).

## Scoping

- Storefront is scoped to a Standard account or a Subaccount.
- Main Account can oversee subaccount storefronts where permissions allow.

## Permissions

`storefront.view` · `storefront.configure` · `storefront.publish` ·
`storefront.unpublish` · `storefront.manageProducts` · `storefront.viewOrders`.

## Edge cases

- **Storefront disabled but route opened** → EnablementGate.
- **Storefront opened before Inventory enabled** → dependency gate ("Enable
  Inventory first").
- **Unpublish while orders pending / deliveries active** → warning + confirmation;
  transactions continue.

## Service contract (mock → BFF)

`getStorefrontProfile(scopeId)` · `getStorefrontStatus(scopeId)` ·
`getStorefrontProducts(scopeId)` · `getPendingOrderImpact(scopeId)` (for the
unpublish warning) · publish/unpublish actions. Checkout/cart flows are demo
state until a real order API exists. Future BFF: `GET/PUT
/accounts/:id/storefront`, `POST /accounts/:id/storefront/publish|unpublish`,
and `POST /orders` or equivalent.
