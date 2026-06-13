# Commerce Rules — GGX Business+

> Overview of the Commerce category. Detail in `inventory_rules.md` and
> `storefront_rules.md`.

## Modules

- **Inventory** — product records that can be attached to booking rows and
  storefront listings.
- **Storefront** — a simple published storefront built from inventory products.
- **Storefront Orders** — demo checkout/cart order flows exist client-side, while
  production order placement remains backend-owned.
- **Product-linked Booking** — attaching inventory products to bulk-booking rows.
- **Storefront Publishing** — draft / published / unpublished lifecycle.

## Dependency chain

```
Inventory  ──required-by──▶  Storefront  ──required-by──▶  Storefront Orders
```

- **Storefront requires Inventory first.** Storefront products must come from
  Inventory. If Inventory is not enabled, Storefront resolves to
  `requires_dependency` with CTA "Enable Inventory first".
- Product-linked Booking requires Inventory.

## Stock integrity (shared rule)

- Stock is **never deducted while editing drafts** (spreadsheet drafts, storefront
  carts in progress).
- Stock is deducted **only after successful backend-confirmed booking/order
  confirmation**.
- Validate availability at attach/submit time; surface (do not silently clamp)
  qty-over-stock and inactive/deleted-product conditions.

## Scoping

- Inventory and Storefront records are scoped to the current account/subaccount.
- Main Account can oversee subaccount inventory/storefronts where permissions
  allow; subaccounts see only their own unless sharing rules are introduced.
- Bulk Booking can only attach inventory products available within the current
  account scope.

## Safety

- Do not treat demo checkout/cart completion as real order placement.
- Do not create real payment/commerce integrations without backend contracts.
