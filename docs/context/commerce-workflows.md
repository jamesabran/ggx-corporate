# Commerce Workflows Context

Use this for Inventory, Storefront, product checkout, cart, and commerce-related
scope questions.

## Current Commerce Modules

- **Inventory:** product records used by storefront listings and bulk booking
  product attachment.
- **Storefront:** merchant-managed public storefront built from Inventory products.
- **Checkout/cart demo surfaces:** client-side/demo storefront order paths that
  exist for prototype flow, not production order placement.

## Dependency Chain

Inventory is required before Storefront. Storefront products must come from
Inventory. Product-linked bulk booking also requires Inventory for picker mode.

## Inventory Truth

- Products are scoped by account/subaccount.
- Main Account may oversee subaccount inventory where permissions allow.
- Managers only manage their assigned scope and permissions.
- Product create/edit/import/export are implemented in demo/mock state.
- Product images and cover images exist in the demo flow.
- Stock is not deducted or reserved while editing drafts, spreadsheet rows, or
  carts in progress.

## Storefront Truth

- Dashboard Storefront supports profile edit, product selection, publish, and
  unpublish.
- Public storefront browsing exists at `/shop/:slug`.
- Unpublishing hides the storefront from new customers but never auto-cancels
  active orders/bookings/deliveries.
- Storefront access must agree with current scope. Subaccount-scoped add-ons must
  enable Storefront on a concrete subaccount, not Main scope.

## Checkout And Cart Truth

Later sessions superseded the older "no checkout" docs:

- Direct product demo checkout exists from product/share entry points.
- Storefront supports adding products to a session cart.
- Cart review exists for quantity adjustment.
- Cart checkout exists as a multi-product COD demo.

Production gaps remain:

- Real order placement API.
- Cart persistence after refresh.
- Backend stock deduction/reservation.
- Authoritative final fee/payment contracts.

## Safety Rules

- Do not create real payment/commerce integrations without an approved backend
  contract.
- Do not treat demo checkout completion as a real order source of truth.
- Do not put final fees, COD terms, or stock mutation in frontend page logic.
