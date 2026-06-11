# Spreadsheet Booking Rules — GGX Business+

> "Type in Spreadsheet" is an **input method inside Bulk Booking**, not a separate
> module. It reuses the same validation and error-correction logic as uploaded
> files.

## Bulk Booking input methods

1. **Upload File** (existing CSV/XLSX flow).
2. **Type in Spreadsheet** (new in-app editable grid).

Both are **input methods feeding one Bulk Booking flow** — not separate flows:
- The shared booking context (sender/pickup, first-mile & schedule, payment,
  delivery mode) renders for **both** methods on the Bulk Upload page.
- Both produce the same `UploadRecord` and proceed to the same review/summary
  route. The record carries a `source: 'file' | 'spreadsheet'` tag so the summary
  can adapt (spreadsheet batches are pre-validated in-grid, so the summary skips
  the file-style error-correction table and uses the real valid-row count).
- The spreadsheet path uses the shared validator `lib/bookingValidation`
  (`validateRows`). The uploaded-file path keeps its template-specific
  correction validator (COD cap, duplicate Reference-ID, pouch size) until real
  file parsing lands — at which point it should adopt `validateRows` **without
  removing** that richer coverage. Neither path forks the spreadsheet validator.

## Spreadsheet capabilities

Editable grid · add row · duplicate row · delete row · paste from Excel/Google
Sheets · inline validation · error highlighting · row-level correction · draft
state · submit valid rows · separate valid and invalid rows before final booking ·
attach inventory products to rows · auto-fill product details from inventory ·
auto-compute item totals · auto-compute declared value / subtotal · auto-compute
delivery fees where available (fees are **backend/service-provided**, not computed
in the frontend).

## Recommended columns

Recipient name · Recipient mobile · Delivery address · Province · City ·
Barangay/District · Product / SKU · Quantity · Declared value · Parcel size /
weight · Service type · Payment method · Notes.

## Product attachment (from Inventory)

When a product is attached from inventory:
- Auto-fill product name / SKU.
- Auto-fill weight / dimensions if available.
- Auto-fill unit price or declared value.
- Multiply by quantity → compute subtotal.
- Validate stock availability.
- **Do not deduct stock** until successful booking/order confirmation.

Only products available within the **current account scope** can be attached.

## Validation & edge cases

- Incomplete pasted data → flag missing required cells per row.
- Mixed valid/invalid rows → separate; allow submitting valid rows, keep invalid
  for correction.
- Row qty > available stock → row error; no deduction, no silent clamp.
- Product inactive after attach → flag row; block until resolved.
- Product deleted while referenced in a draft → flag unresolved reference.

## Implementation guidance

- Reuse existing upload-validation utilities/services; do not duplicate.
- If the full spreadsheet is too large for one pass: ship a simple editable grid
  first, then add product attachment + validation in a following pass.
- Fees, surcharges, and any financial totals beyond simple qty×unitPrice display
  come from the service layer, not the frontend.
