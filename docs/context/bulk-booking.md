# Bulk Booking Context

Use this for Bulk Upload, in-app Spreadsheet, product attachment, fee estimates,
and booking validation.

## Core Shape

Bulk Booking has two input methods feeding one flow:

1. Upload File.
2. Type in Spreadsheet.

Upload File remains the default. Type in Spreadsheet is a secondary path under
Bulk Upload, not a standalone module and not a sidebar item.

## Spreadsheet Rules

- Route stays under Bulk Upload.
- Page/service type is selected once per batch: Standard, Same-Day, or On-Demand
  when enabled for the scope.
- Do not reintroduce per-row service type, per-row payment, or notes columns.
- Location fields use the GGX-supported location cascade, not free-text-only.
- Add row sits at the bottom-left below the grid.
- Spreadsheet rows use shared validation as the user types.
- Mixed valid/invalid rows are separated; valid rows may proceed while invalid
  rows stay available for correction.

## Product Attachment

- Inventory-enabled scopes use a product picker in the Product/SKU cell.
- Attached products can include multiple products with per-product quantities.
- Quantity and declared value are derived from attached product snapshots.
- Product attachment is a draft aid; it does not reserve or deduct stock.
- Unknown, inactive, deleted, or over-stock products must flag validation errors.
- If Inventory is not enabled, Product/SKU remains free text.

## Fees

- Current spreadsheet/Bulk Upload fee displays are labeled estimates.
- Final fees are backend-owned.
- Item Protection and location-based delivery rates are deferred until a richer
  BFF fee estimate/finalization contract exists.
- Do not partially update fee math without updating summary, validation, and the
  service contract together.

## Upload File Preservation

- Preserve existing Upload File behavior when changing spreadsheet booking.
- Uploaded-file validation retains template-specific coverage until real file
  parsing exists.
- Future adoption of `lib/bookingValidation` in the uploaded-file path must not
  remove COD cap, duplicate Reference ID, pouch size, or similar coverage.
