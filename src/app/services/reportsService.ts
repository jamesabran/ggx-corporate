/**
 * reportsService — reports & downloads facade.
 *
 * Data-returning functions are async to match a real API contract.
 * Currently backed by `data/reports.ts` (static seed + frontend CSV generation).
 *
 * ── Architecture / ownership ───────────────────────────────────────────────
 * Frontend-facing facade. Report contents and figures (billing totals,
 * settlement/net-payout values, delivery/analytics metrics) are backend-owned
 * (FTX / analytics via the GGX Corporate BFF) — the frontend does NOT compute
 * them. Report *generation* is a backend job; the UI's optimistic
 * "generating → ready" transition is a DEMO STAND-IN for a backend job
 * completing (see MOCK_SERVICE_LAYER.md §1c), not frontend orchestration.
 *
 * `downloadReport` produces a CSV client-side only because no backend export
 * endpoint exists yet; in production the file/bytes come from the backend.
 *
 * Future API endpoints:
 *   GET  /reports             → getReports
 *   POST /reports/generate    → requestReport
 *   GET  /reports/:id/download → downloadReport (real bytes from backend)
 */

import {
  SEED_REPORTS,
  REPORT_TYPE_META,
  REPORT_STATUS_META,
  downloadReport,
  type ReportItem,
  type ReportType,
  type ReportStatus,
} from '../data/reports';

export type { ReportItem, ReportType, ReportStatus };
// Presentation config + the client-side download action (no backend export yet).
export { REPORT_TYPE_META, REPORT_STATUS_META, downloadReport };

export interface ReportFilters {
  type?: ReportType | 'all';
  subaccountId?: string;
}

/** Return the report list, with optional type/subaccount filters. */
export async function getReports(filters?: ReportFilters): Promise<ReportItem[]> {
  let result = [...SEED_REPORTS];
  if (filters?.type && filters.type !== 'all') {
    result = result.filter((r) => r.type === filters.type);
  }
  if (filters?.subaccountId) {
    result = result.filter((r) => r.accountId === filters.subaccountId);
  }
  return result;
}
