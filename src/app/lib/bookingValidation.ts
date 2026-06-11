/**
 * Booking-row validation — the shared validation pipeline for Bulk Booking.
 *
 * Used by the in-app "Type in Spreadsheet" grid and intended for reuse by the
 * uploaded-file path (parse rows → validateRows) so both intake methods apply
 * the SAME rules. See docs/spreadsheet_booking_rules.md.
 *
 * This is presentation/format/completeness validation only (required fields,
 * basic formats) — allowed in the frontend. Authoritative checks (service-area
 * coverage, fees, stock deduction, location validity) remain backend/service
 * concerns and are layered in later, not computed here.
 */

import { BOOKING_SERVICE_TYPES, SERVICE_TYPES, type ServiceTypeKey } from '../data/serviceTypes';
import { RECEPTACLE_SIZES } from '../data/bulkTemplate';

export type BookingField =
  | 'recipientName'
  | 'recipientMobile'
  | 'address'
  | 'province'
  | 'city'
  | 'barangay'
  | 'productSku'
  | 'quantity'
  | 'declaredValue'
  | 'parcelSize'
  | 'serviceType'
  | 'notes';

/**
 * A product attached to a booking row from Inventory. Carries a snapshot of the
 * product (name/sku/price/weight) for display + payload; stock and status are
 * re-validated live against the current scope's products (see `validateRow`).
 */
export interface AttachedProduct {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  weight?: number;
}

/** Live availability for an attached product (looked up by productId). */
export interface ProductAvailability {
  stockQuantity: number;
  status: 'active' | 'inactive';
}

export interface BookingRow extends Record<BookingField, string> {
  /** Stable client id for the grid (not part of the booking payload). */
  id: string;
  /** Products attached from Inventory (optional; manual entry leaves this empty). */
  products?: AttachedProduct[];
}

/** Sum of unitPrice × quantity across attached products (item subtotal). */
export function attachmentSubtotal(products: AttachedProduct[] = []): number {
  return products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
}

/** Total item count across attached products. */
export function attachmentTotalQty(products: AttachedProduct[] = []): number {
  return products.reduce((sum, p) => sum + p.quantity, 0);
}

export interface ColumnDef {
  key: BookingField;
  label: string;
  required: boolean;
  /** Fixed option set (renders a select); omitted = free text. */
  options?: readonly string[];
  /** Fixed column width in px. The grid uses a <colgroup> + table-fixed so these
   *  are authoritative and the table overflows horizontally instead of shrinking. */
  width: number;
}

export const SERVICE_TYPE_OPTIONS: { value: ServiceTypeKey; label: string }[] =
  BOOKING_SERVICE_TYPES.map((k) => ({ value: k, label: SERVICE_TYPES[k].label }));

// Column widths are sized so labels and content (incl. cascade dropdown labels
// like "Select province") have breathing room. The grid forces horizontal scroll
// rather than compressing columns (see SpreadsheetBookingGrid).
export const BOOKING_COLUMNS: ColumnDef[] = [
  { key: 'recipientName',  label: 'Recipient name',   required: true,  width: 180 },
  { key: 'recipientMobile',label: 'Recipient mobile', required: true,  width: 180 },
  { key: 'address',        label: 'Delivery address', required: true,  width: 340 },
  { key: 'province',       label: 'Province',         required: true,  width: 190 },
  { key: 'city',           label: 'City',             required: true,  width: 190 },
  { key: 'barangay',       label: 'Barangay',         required: true,  width: 200 },
  // Product / SKU is intentionally wide to support a future multi-product
  // summary (chip + "+N more") once Inventory attachment lands. Manual entry now.
  { key: 'productSku',     label: 'Product / SKU',    required: false, width: 300 },
  { key: 'quantity',       label: 'Qty',              required: true,  width: 90 },
  { key: 'declaredValue',  label: 'Declared value',   required: false, width: 160 },
  { key: 'parcelSize',     label: 'Parcel size',      required: false, width: 180, options: RECEPTACLE_SIZES },
];

/** Fixed widths (px) for the grid's row-number and row-actions columns. */
export const ROW_NUMBER_WIDTH = 48;
export const ROW_ACTIONS_WIDTH = 80;
// Service type is chosen at the page/flow level (Standard / Same-Day / On-Demand),
// not per row, so it is NOT a grid column. Notes were removed to keep the row
// focused on booking/recipient/parcel/location/product fields.
//
// Shipping-fee payment is handled once for the batch under "Confirm booking
// details" (account payment options), so there is NO per-row Payment column.
// FUTURE: align this grid with the Bulk Upload template's item/payment fields
// (e.g. COD amount, declared value, line-item protection) in a dedicated pass —
// not implemented yet.

const REQUIRED_FIELDS = BOOKING_COLUMNS.filter((c) => c.required).map((c) => c.key);

export interface RowValidation {
  rowId: string;
  errors: Partial<Record<BookingField, string>>;
  isValid: boolean;
  /** A fully blank row — ignored (not counted as valid or invalid). */
  isEmpty: boolean;
}

export function makeEmptyRow(id: string): BookingRow {
  return {
    id,
    recipientName: '', recipientMobile: '', address: '', province: '', city: '',
    barangay: '', productSku: '', quantity: '', declaredValue: '', parcelSize: '',
    serviceType: '', notes: '',
  };
}

function isRowBlank(row: BookingRow): boolean {
  if (row.products && row.products.length > 0) return false;
  return BOOKING_COLUMNS.every((c) => !row[c.key]?.trim());
}

/**
 * Validate a single row (format + completeness only).
 *
 * When `productIndex` is supplied (the in-grid path, where the scope's products
 * are known), attached products are re-validated live: an unknown id flags a
 * deleted reference, `inactive` status flags an unresolved product, and a
 * quantity above available stock flags insufficient stock. No stock is deducted
 * here — deduction is a backend operation on confirmed booking. See
 * docs/inventory_rules.md.
 */
export function validateRow(
  row: BookingRow,
  productIndex?: Map<string, ProductAvailability>,
): RowValidation {
  const errors: Partial<Record<BookingField, string>> = {};

  if (isRowBlank(row)) {
    return { rowId: row.id, errors, isValid: false, isEmpty: true };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!row[field]?.trim()) errors[field] = 'Required';
  }

  const mobile = row.recipientMobile.trim();
  if (mobile && !/^(\+?63|0)9\d{9}$/.test(mobile.replace(/[\s-]/g, ''))) {
    errors.recipientMobile = 'Invalid PH mobile';
  }

  const qty = row.quantity.trim();
  if (qty && (!/^\d+$/.test(qty) || Number(qty) < 1)) {
    errors.quantity = 'Must be a whole number ≥ 1';
  }

  const declared = row.declaredValue.trim();
  if (declared && (Number.isNaN(Number(declared)) || Number(declared) < 0)) {
    errors.declaredValue = 'Must be a number ≥ 0';
  }

  if (row.serviceType && !BOOKING_SERVICE_TYPES.includes(row.serviceType as ServiceTypeKey)) {
    errors.serviceType = 'Unsupported service type';
  }

  // Attached-product stock / status / reference checks (live, no deduction).
  if (row.products && row.products.length > 0) {
    for (const ap of row.products) {
      const avail = productIndex?.get(ap.productId);
      if (productIndex && !avail) {
        errors.productSku = `${ap.name} is no longer available — remove or replace it`;
        break;
      }
      if (avail && avail.status === 'inactive') {
        errors.productSku = `${ap.name} is inactive — remove or replace it`;
        break;
      }
      if (avail && ap.quantity > avail.stockQuantity) {
        errors.productSku = `Only ${avail.stockQuantity} of ${ap.name} in stock`;
        break;
      }
    }
  }

  return { rowId: row.id, errors, isValid: Object.keys(errors).length === 0, isEmpty: false };
}

export interface RowsValidationResult {
  validations: Record<string, RowValidation>;
  /** Non-empty rows with no errors. */
  validRows: BookingRow[];
  /** Non-empty rows with at least one error. */
  invalidRows: BookingRow[];
  /** Count of fully blank rows (ignored). */
  emptyCount: number;
}

/** Validate all rows, separating valid from invalid (blank rows ignored). */
export function validateRows(
  rows: BookingRow[],
  productIndex?: Map<string, ProductAvailability>,
): RowsValidationResult {
  const validations: Record<string, RowValidation> = {};
  const validRows: BookingRow[] = [];
  const invalidRows: BookingRow[] = [];
  let emptyCount = 0;

  for (const row of rows) {
    const v = validateRow(row, productIndex);
    validations[row.id] = v;
    if (v.isEmpty) emptyCount += 1;
    else if (v.isValid) validRows.push(row);
    else invalidRows.push(row);
  }

  return { validations, validRows, invalidRows, emptyCount };
}
