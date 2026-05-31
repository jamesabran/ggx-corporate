/**
 * slaService — SLA alerts / operations monitoring facade.
 *
 * All data-returning functions are async to match a real API contract.
 * Currently backed by `data/slaAlerts.ts` (module state + localStorage).
 *
 * ── Architecture / ownership ───────────────────────────────────────────────
 * Frontend-facing facade. SLA alerts and their statuses (No Movement / Breach /
 * monitoring / resolved) are NOT computed by the frontend — in production they
 * are derived backend-side from fulfillment/FarEye-linked events + OMS state and
 * surfaced via the GGX Corporate BFF. SLA hit/miss and breach determination are
 * official, backend-owned values.
 *
 * Cross-system note (see MOCK_SERVICE_LAYER.md §1c): sending a follow-up today
 * also pushes a notification synchronously inside the data layer. That is a
 * DEMO STAND-IN for a backend-emitted event — in production the BFF/NS emits the
 * follow-up notification and any derived-status changes. The frontend only
 * issues the single "send follow-up" / "resolve" intent and renders the result.
 *
 * Future API endpoints:
 *   GET  /sla-alerts                 → getSlaAlertsList
 *   POST /sla-alerts/:id/follow-up   → sendAlertFollowUp
 *   POST /sla-alerts/:id/resolve     → resolveSlaAlert
 */

import {
  getSlaAlerts,
  sendFollowUp,
  resolveAlert,
  SLA_TYPE_META,
  SLA_STATUS_META,
  type SlaAlert,
  type SlaAlertType,
  type SlaAlertStatus,
} from '../data/slaAlerts';

export type { SlaAlert, SlaAlertType, SlaAlertStatus };
// Presentation config (icon/label/colors per type + status). Not data access.
export { SLA_TYPE_META, SLA_STATUS_META };

export interface SlaAlertFilters {
  type?: SlaAlertType | 'all';
  subaccountId?: string;
  openOnly?: boolean;
}

/** Return SLA alerts, with optional type/subaccount/open filters. */
export async function getSlaAlertsList(filters?: SlaAlertFilters): Promise<SlaAlert[]> {
  let result = [...getSlaAlerts()];
  if (filters?.type && filters.type !== 'all') {
    result = result.filter((a) => a.type === filters.type);
  }
  if (filters?.subaccountId) {
    result = result.filter((a) => a.accountId === filters.subaccountId);
  }
  if (filters?.openOnly) {
    result = result.filter((a) => a.status !== 'resolved');
  }
  return result;
}

/** Send a follow-up to the assigned hub/forwarder (backend emits the event). */
export async function sendAlertFollowUp(id: string, note?: string): Promise<void> {
  sendFollowUp(id, note);
}

/** Mark an alert resolved. */
export async function resolveSlaAlert(id: string): Promise<void> {
  resolveAlert(id);
}
