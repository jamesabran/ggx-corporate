/**
 * Bulk Booking fee ESTIMATE (frontend preview only).
 *
 * Authoritative fees, surcharges, and insurance are backend/source-system owned
 * (see docs/service_layer_rules.md). This module produces a clearly-labeled
 * estimate so the spreadsheet entry page can give live feedback as the user
 * types, with a pending state when inputs are incomplete. It must not be treated
 * as the source of truth — the booking confirmation returns final fees.
 */

import type { BookingRow } from './bookingValidation';
import type { ServiceTypeKey } from '../data/serviceTypes';

const SIZE_FEE: Record<string, number> = {
  SMALL: 80, MEDIUM: 120, LARGE: 180, BOX: 250, OVERSIZED: 350,
};

const SERVICE_SURCHARGE: Record<ServiceTypeKey, number> = {
  standard: 0, same_day: 70, on_demand: 150, special_pickup: 0, high_volume: 0,
};

/**
 * Estimate the shipping fee for a single row, or `null` when there isn't enough
 * info yet (missing/unknown parcel size or service type) — the caller shows a
 * pending state rather than an error.
 */
export function estimateRowFee(row: BookingRow): number | null {
  const size = row.parcelSize?.trim().toUpperCase();
  if (!size || !(size in SIZE_FEE)) return null;
  const svc = row.serviceType?.trim() as ServiceTypeKey;
  if (!svc || !(svc in SERVICE_SURCHARGE)) return null;
  return SIZE_FEE[size] + SERVICE_SURCHARGE[svc];
}

export interface FeeEstimate {
  /** Summed estimated shipping fee across rows that could be computed. */
  shipping: number;
  /** Rows that produced an estimate. */
  computedRows: number;
  /** Rows still missing inputs needed to estimate (pending, not an error). */
  pendingRows: number;
}

/** Estimate fees across the given (valid) rows. */
export function estimateFees(rows: BookingRow[]): FeeEstimate {
  let shipping = 0;
  let computedRows = 0;
  let pendingRows = 0;
  for (const row of rows) {
    const fee = estimateRowFee(row);
    if (fee === null) pendingRows += 1;
    else { shipping += fee; computedRows += 1; }
  }
  return { shipping, computedRows, pendingRows };
}
