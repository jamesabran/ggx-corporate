# Storefront Rules — GGX Business+

> Simple storefront built from inventory products. Model in `data/storefront.ts`;
> access via `services/storefrontService.ts`. See `commerce_rules.md`.

## Dependency

- **Storefront requires Inventory first.** Storefront products must come from
  Inventory. If Inventory is not enabled for the scope, Storefront resolves to
  `requires_dependency` → "Enable Inventory first".

## Capabilities

- Storefront enablement (per Standard account or Subaccount scope).
- Store profile setup: store name · description · logo/banner placeholder ·
  store URL/slug · contact information.
- Product selection from Inventory.
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
unpublish warning) · publish/unpublish actions. Orders are **placeholders** — do
not build checkout yet. Future BFF: `GET/PUT /accounts/:id/storefront`,
`POST /accounts/:id/storefront/publish|unpublish`.
