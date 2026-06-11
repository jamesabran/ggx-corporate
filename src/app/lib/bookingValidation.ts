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
  | 'paymentMethod'
  | 'notes';

export interface BookingRow extends Record<BookingField, string> {
  /** Stable client id for the grid (not part of the booking payload). */
  id: string;
}

export interface ColumnDef {
  key: BookingField;
  label: string;
  required: boolean;
  /** Fixed option set (renders a select); omitted = free text. */
  options?: readonly string[];
  /** Suggested column width class. */
  width?: string;
}

export const PAYMENT_METHODS = ['COD', 'Prepaid', 'Billing'] as const;

export const SERVICE_TYPE_OPTIONS: { value: ServiceTypeKey; label: string }[] =
  BOOKING_SERVICE_TYPES.map((k) => ({ value: k, label: SERVICE_TYPES[k].label }));

export const BOOKING_COLUMNS: ColumnDef[] = [
  { key: 'recipientName',  label: 'Recipient name',   required: true,  width: 'w-44' },
  { key: 'recipientMobile',label: 'Recipient mobile', required: true,  width: 'w-36' },
  { key: 'address',        label: 'Delivery address', required: true,  width: 'w-52' },
  { key: 'province',       label: 'Province',         required: true,  width: 'w-36' },
  { key: 'city',           label: 'City',             required: true,  width: 'w-36' },
  { key: 'barangay',       label: 'Barangay',         required: true,  width: 'w-36' },
  { key: 'productSku',     label: 'Product / SKU',    required: false, width: 'w-36' },
  { key: 'quantity',       label: 'Qty',              required: true,  width: 'w-20' },
  { key: 'declaredValue',  label: 'Declared value',   required: false, width: 'w-32' },
  { key: 'parcelSize',     label: 'Parcel size',      required: false, width: 'w-32', options: RECEPTACLE_SIZES },
  { key: 'serviceType',    label: 'Service type',     required: true,  width: 'w-40', options: BOOKING_SERVICE_TYPES },
  { key: 'paymentMethod',  label: 'Payment',          required: true,  width: 'w-32', options: PAYMENT_METHODS },
  { key: 'notes',          label: 'Notes',            required: false, width: 'w-44' },
];

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
    serviceType: '', paymentMethod: '', notes: '',
  };
}

function isRowBlank(row: BookingRow): boolean {
  return BOOKING_COLUMNS.every((c) => !row[c.key]?.trim());
}

/** Validate a single row (format + completeness only). */
export function validateRow(row: BookingRow): RowValidation {
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

  if (row.paymentMethod && !(PAYMENT_METHODS as readonly string[]).includes(row.paymentMethod)) {
    errors.paymentMethod = 'Unsupported payment method';
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
export function validateRows(rows: BookingRow[]): RowsValidationResult {
  const validations: Record<string, RowValidation> = {};
  const validRows: BookingRow[] = [];
  const invalidRows: BookingRow[] = [];
  let emptyCount = 0;

  for (const row of rows) {
    const v = validateRow(row);
    validations[row.id] = v;
    if (v.isEmpty) emptyCount += 1;
    else if (v.isValid) validRows.push(row);
    else invalidRows.push(row);
  }

  return { validations, validRows, invalidRows, emptyCount };
}
