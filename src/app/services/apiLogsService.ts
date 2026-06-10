/**
 * API Logs service facade (API Integration → API Logs).
 *
 * Contract between the API Logs UI and the BFF. Currently backed by mock data
 * (`data/apiLogs.ts`). Future: GET /integrations/api/logs.
 *
 * Log entries, statuses, and messages are backend-owned; the frontend only
 * presents and filters them.
 */

import { apiLogs, type ApiLog, type ApiLogStatus } from '../data/apiLogs';

export type { ApiLog, ApiLogStatus };

export const API_LOG_STATUS_META: Record<ApiLogStatus, {
  label: string;
  variant: 'success' | 'danger' | 'warning';
}> = {
  success: { label: 'Success', variant: 'success' },
  failed:  { label: 'Failed',  variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
};

export interface ApiLogFilters {
  status?: ApiLogStatus | 'all';
  search?: string;
}

/** Return API logs (newest-first), optionally filtered by status and search. */
export async function getApiLogs(filters?: ApiLogFilters): Promise<ApiLog[]> {
  let result = [...apiLogs];
  const { status, search } = filters ?? {};
  if (status && status !== 'all') {
    result = result.filter((l) => l.status === status);
  }
  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.endpoint.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q) ||
        (l.reference?.toLowerCase().includes(q) ?? false)
    );
  }
  return result;
}
