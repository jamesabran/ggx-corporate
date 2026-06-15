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
import { RECEPTACLE_SIZES, BULK_FIELD_LABELS as L } from '../data/bulkTemplate';

export type BookingField =
  | 'recipientName'
  | 'recipientMobile'
  | 'address'
  | 'province'
  | 'city'
  | 'barangay'
  | 'landmarks'
  | 'productSku'
  | 'quantity'
  | 'parcelSize'
  | 'cod'
  | 'codAmount'
  | 'declaredValue'
  | 'insureFull'
  | 'recipientPaysFees'
  | 'referenceId'
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

/** Yes/No option set for COD / insure / recipient-pays-fees cells. */
export const YES_NO = ['Yes', 'No'] as const;

// Columns mirror the official Bulk Upload template (data/bulkTemplate.ts) as
// closely as practical for the demo: recipient + destination, item, receptacle
// size, COD option + collectible amount, declared value, full-value insurance,
// recipient-pays-fees, and reference ID. Service type is page-level (not per row);
// shipping-fee payment is chosen once under "Confirm booking details" (no per-row
// Payment column); Item Protection Fee is a derived display, not an input column.
// Widths give labels + cascade dropdowns room; the grid scrolls horizontally
// rather than compressing columns (see SpreadsheetBookingGrid).
// Labels come from the shared BULK_FIELD_LABELS so the grid matches the column
// mapper, failed-orders table, and template. Required/optional follows the shared
// field model. Exceptions (kept to avoid breaking flow behavior): COD Amount is
// conditionally required (only when "Cash on delivery (COD)" = Yes, enforced in
// validateRow), so it stays required:false here; Item Name (productSku) is
// required but the requirement is satisfied by attached Inventory products (see
// validateRow). Qty is grid-specific (not in the shared model).
export const BOOKING_COLUMNS: ColumnDef[] = [
  { key: 'recipientName',    label: L.name,              required: true,  width: 180 },
  { key: 'recipientMobile',  label: L.mobile,            required: true,  width: 180 },
  { key: 'address',          label: L.streetAddress,     required: true,  width: 300 },
  { key: 'province',         label: L.province,          required: true,  width: 190 },
  { key: 'city',             label: L.cityMunicipality,  required: true,  width: 190 },
  { key: 'barangay',         label: L.barangay,          required: true,  width: 200 },
  { key: 'landmarks',        label: L.landmarks,         required: false, width: 280 },
  { key: 'productSku',       label: L.itemName,          required: true,  width: 240 },
  { key: 'quantity',         label: 'Qty',               required: true,  width: 80 },
  { key: 'parcelSize',       label: L.pouchSize,         required: true,  width: 170, options: RECEPTACLE_SIZES },
  { key: 'codAmount',        label: L.codAmount,         required: false, width: 160 },
  { key: 'cod',              label: L.cod,               required: true,  width: 200, options: YES_NO },
  { key: 'declaredValue',    label: L.declaredValue,     required: true,  width: 180 },
  { key: 'insureFull',       label: L.insureFull,        required: true,  width: 200, options: YES_NO },
  { key: 'recipientPaysFees',label: L.recipientPaysFees, required: true,  width: 200, options: YES_NO },
  { key: 'referenceId',      label: L.referenceId,       required: false, width: 200 },
];

/** Fixed widths (px) for the grid's row-number and row-actions columns. */
export const ROW_NUMBER_WIDTH = 48;
export const ROW_ACTIONS_WIDTH = 80;
/** COD collectible amount must not exceed this (template rule). */
export const COD_MAX = 50000;

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
    barangay: '', landmarks: '', productSku: '', quantity: '', parcelSize: '',
    cod: '', codAmount: '', declaredValue: '', insureFull: '', recipientPaysFees: '',
    referenceId: '', serviceType: '', notes: '',
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
/** Same-Day / On-Demand are Metro Manila-only at booking time. */
export function isMetroManila(province: string): boolean {
  return /metro manila|ncr|national capital/i.test(province);
}

export interface RowValidationOptions {
  /** When true, non-Metro-Manila provinces are flagged (Same-Day / On-Demand). */
  metroOnly?: boolean;
}

export function validateRow(
  row: BookingRow,
  productIndex?: Map<string, ProductAvailability>,
  opts?: RowValidationOptions,
): RowValidation {
  const errors: Partial<Record<BookingField, string>> = {};

  if (isRowBlank(row)) {
    return { rowId: row.id, errors, isValid: false, isEmpty: true };
  }

  for (const field of REQUIRED_FIELDS) {
    // Item Name requirement is satisfied by attached Inventory products (the
    // free-text cell stays empty while products are attached).
    if (field === 'productSku' && row.products && row.products.length > 0) continue;
    if (!row[field]?.trim()) errors[field] = 'Required';
  }

  // Same-Day / On-Demand service area: Metro Manila only.
  if (opts?.metroOnly && row.province.trim() && !isMetroManila(row.province)) {
    errors.province = 'Same-Day / On-Demand: Metro Manila only';
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

  // COD: when collecting, a valid collectible amount (≤ template cap) is required.
  const codAmount = row.codAmount.trim();
  if (codAmount && (Number.isNaN(Number(codAmount)) || Number(codAmount) < 0)) {
    errors.codAmount = 'Must be a number ≥ 0';
  } else if (row.cod === 'Yes') {
    if (!codAmount) errors.codAmount = 'Enter the amount to collect';
    else if (Number(codAmount) > COD_MAX) errors.codAmount = `Cannot exceed ₱${COD_MAX.toLocaleString()}`;
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
  opts?: RowValidationOptions,
): RowsValidationResult {
  const validations: Record<string, RowValidation> = {};
  const validRows: BookingRow[] = [];
  const invalidRows: BookingRow[] = [];
  let emptyCount = 0;

  for (const row of rows) {
    const v = validateRow(row, productIndex, opts);
    validations[row.id] = v;
    if (v.isEmpty) emptyCount += 1;
    else if (v.isValid) validRows.push(row);
    else invalidRows.push(row);
  }

  return { validations, validRows, invalidRows, emptyCount };
}
