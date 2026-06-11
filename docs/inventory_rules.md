# Inventory Rules — GGX Business+

> Product inventory. Model in `data/inventory.ts`; access via
> `services/inventoryService.ts`. See `commerce_rules.md` for shared commerce rules.

## Enablement

- Inventory can be **self-enabled or contract-based** depending on business rules
  (activation mode is data-driven in the module catalog).
- Products can be attached to booking rows and storefront listings.

## Product model (`InventoryProduct`)

product name · SKU · description · category · unit price · weight · dimensions
(L×W×H) · stock quantity · low-stock threshold · product image placeholder ·
status (`active` / `inactive`) · account scope / subaccount ownership
(`scopeAccountId`) · created by / updated by · timestamps.

## Scoping

- **Main Account** can view/manage all inventory across subaccounts **if
  permissions allow**.
- **Subaccount** can view/manage only its own inventory unless sharing rules are
  introduced.
- **Manager** can manage only the assigned subaccount's inventory, and only if
  granted the relevant permission.
- Every product carries `scopeAccountId`; the service filters by the viewer's
  resolved scope (`useScopedAccountId`). A subaccount must never receive Main or
  other subaccounts' products.

## Stock rules

- Stock is **not** deducted while editing drafts.
- Stock is deducted **only** after successful booking/order confirmation.
- Stock availability is validated when a product is attached to a booking row and
  again at submit.

## Permissions

`inventory.view` · `inventory.create` · `inventory.edit` · `inventory.delete` ·
`inventory.adjustStock` · `inventory.import` · `inventory.export`.

## Edge cases

- **Inventory disabled but route opened** → EnablementGate (no product fetch).
- **Subaccount tries to access Main inventory** → service returns only the
  subaccount's products.
- **Spreadsheet row qty > available stock** → validation error on the row; do not
  deduct, do not silently clamp.
- **Product becomes inactive after being attached to a draft row** → flag the row;
  block submit until resolved.
- **Inventory product deleted while referenced in a draft** → flag the row as
  unresolved reference; require correction.

## Service contract (mock → BFF)

`getInventoryProducts(scopeId)` · `getInventoryProduct(id)` ·
`createProduct` / `updateProduct` / `deleteProduct` / `adjustStock`.
Future BFF: `GET/POST/PUT/DELETE /accounts/:id/inventory/products`.
Stock deduction is a backend operation tied to confirmed bookings/orders — the
frontend never mutates authoritative stock on its own.
