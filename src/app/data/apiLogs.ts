/**
 * Mock seed data for the API Integration → API Logs view.
 *
 * Records of recent API requests / webhook events for the account's API
 * integration. Future: replace with GET /integrations/api/logs from the BFF.
 * Log entries, statuses, and messages are backend-owned; the frontend only
 * presents and filters them.
 */

export type ApiLogStatus = 'success' | 'failed' | 'warning';

export interface ApiLog {
  id: string;
  /** Request / event timestamp. */
  timestamp: string;
  /** Endpoint path or webhook event name. */
  endpoint: string;
  /** HTTP method (display only). */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'EVENT';
  status: ApiLogStatus;
  /** Short human-readable message. */
  message: string;
  /** Related tracking / order / reference number, when applicable. */
  reference?: string;
}

// Newest-first sample log set.
export const apiLogs: ApiLog[] = [
  {
    id: 'LOG-2026-10241',
    timestamp: '2026-06-10 10:12:44',
    endpoint: 'POST /v1/bookings',
    method: 'POST',
    status: 'success',
    message: 'Booking created successfully.',
    reference: 'GGX-2026-90010',
  },
  {
    id: 'LOG-2026-10240',
    timestamp: '2026-06-10 10:11:08',
    endpoint: 'webhook: delivery.status_changed',
    method: 'EVENT',
    status: 'success',
    message: 'Webhook delivered — endpoint responded 200 OK.',
    reference: 'GGX-2026-90009',
  },
  {
    id: 'LOG-2026-10239',
    timestamp: '2026-06-10 10:04:51',
    endpoint: 'GET /v1/transactions/GGX-2026-90008',
    method: 'GET',
    status: 'success',
    message: 'Transaction retrieved.',
    reference: 'GGX-2026-90008',
  },
  {
    id: 'LOG-2026-10238',
    timestamp: '2026-06-10 09:58:19',
    endpoint: 'POST /v1/bookings',
    method: 'POST',
    status: 'failed',
    message: 'Validation error — recipient address is missing a barangay.',
    reference: 'SH-1042',
  },
  {
    id: 'LOG-2026-10237',
    timestamp: '2026-06-10 09:51:37',
    endpoint: 'webhook: delivery.status_changed',
    method: 'EVENT',
    status: 'warning',
    message: 'Webhook retried — endpoint responded 500, retry scheduled.',
    reference: 'GGX-2026-90006',
  },
  {
    id: 'LOG-2026-10236',
    timestamp: '2026-06-10 09:45:02',
    endpoint: 'POST /v1/bookings/bulk',
    method: 'POST',
    status: 'success',
    message: 'Bulk booking accepted — 247 orders queued.',
    reference: 'UPLOAD-2026-05-31-001',
  },
  {
    id: 'LOG-2026-10235',
    timestamp: '2026-06-10 09:30:55',
    endpoint: 'GET /v1/rates',
    method: 'GET',
    status: 'success',
    message: 'Shipping rates returned.',
  },
  {
    id: 'LOG-2026-10234',
    timestamp: '2026-06-10 09:12:23',
    endpoint: 'POST /v1/keys/authenticate',
    method: 'POST',
    status: 'warning',
    message: 'Rate limit at 85% of hourly quota.',
  },
  {
    id: 'LOG-2026-10233',
    timestamp: '2026-06-10 08:47:10',
    endpoint: 'GET /v1/transactions',
    method: 'GET',
    status: 'failed',
    message: 'Unauthorized — API key expired. Regenerate a new key.',
  },
  {
    id: 'LOG-2026-10232',
    timestamp: '2026-06-10 08:30:41',
    endpoint: 'webhook: pickup.confirmed',
    method: 'EVENT',
    status: 'success',
    message: 'Webhook delivered — endpoint responded 200 OK.',
    reference: 'GGX-2026-90001',
  },
];
