/**
 * Mock seed data for the Shopify integration.
 *
 * The Shopify integration connects ONE Shopify store to ONE GGX account or
 * subaccount (1 store ↔ 1 account/subaccount). A non-subaccount standard
 * account can connect one store; each subaccount can have its own; some
 * subaccounts may have none.
 *
 * Future: replace with GET /integrations/shopify/* from the BFF. Connection
 * status, last-sync timestamps, and sync log events are backend/source-system
 * owned — the frontend only presents them.
 */

import { MAIN_ACCOUNT_ID } from './accounts';

/** Synthetic account id used for the non-subaccount standard-account demo state. */
export const STANDARD_ACCOUNT_ID = 'standard-account';

export type ShopifyConnectionStatus = 'connected' | 'error';

/** A single Shopify sync log status. */
export type SyncStatus = 'success' | 'failed' | 'warning';

/** The kinds of activity recorded between Shopify and GGX. */
export type SyncEventType =
  | 'store_connected'
  | 'order_synced'
  | 'pickup_request_sent'
  | 'pickup_request_failed'
  | 'tracking_pushed'
  | 'store_disconnected'
  | 'auth_error';

export interface ConnectedStore {
  /** Canonical GGX account/subaccount id this store maps to. */
  accountId: string;
  /** Display name of the connected GGX account/subaccount. */
  accountName: string;
  storeName: string;
  /** Shopify store domain, e.g. acme-luzon.myshopify.com */
  storeDomain: string;
  status: ShopifyConnectionStatus;
  /** Backend-provided last activity timestamp (most recent sync/pickup/status event). */
  lastSyncAt: string;
  /** Name of the user who connected the store. */
  connectedBy: string;
  connectedAt: string;
  /** Rolled-up connection health for the coverage view (backend-provided). */
  syncHealth: 'healthy' | 'warning' | 'error';
  // ── Backend-provided operational rollups (treated as BFF-supplied, not UI-computed) ──
  /** Shopify-origin bookings currently awaiting pickup. */
  pendingPickups: number;
  /** Shopify-origin bookings created this period (recent/month). */
  monthlyBookings: number;
  /** Shopify pickup requests that failed and need attention. */
  failedRequests: number;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  storeName: string;
  /** Canonical GGX account/subaccount id (for scoping). */
  accountId: string;
  accountName: string;
  event: SyncEventType;
  status: SyncStatus;
  message: string;
  /** Related order / reference number when applicable. */
  referenceNumber?: string;
}

// ─── Connected stores ─────────────────────────────────────────────────────────
//
// Keyed by GGX account/subaccount id. A subaccount with no entry here has no
// connected Shopify store (renders the empty state). One store per account.

export const connectedStores: ConnectedStore[] = [
  {
    accountId: 'acme-corporation',
    accountName: 'Acme Corporation',
    storeName: 'Acme Corporation Store',
    storeDomain: 'acme-corp.myshopify.com',
    status: 'connected',
    lastSyncAt: '2026-06-10 09:42 AM',
    connectedBy: 'Max Rodriguez',
    connectedAt: '2026-03-14',
    syncHealth: 'healthy',
    pendingPickups: 4,
    monthlyBookings: 26,
    failedRequests: 0,
  },
  {
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    storeName: 'Acme Luzon Online',
    storeDomain: 'acme-luzon.myshopify.com',
    status: 'connected',
    lastSyncAt: '2026-06-10 08:15 AM',
    connectedBy: 'Sarah Williams',
    connectedAt: '2026-04-02',
    // Has recent failed pickup requests + an auth warning needing attention.
    syncHealth: 'warning',
    pendingPickups: 3,
    monthlyBookings: 18,
    failedRequests: 2,
  },
  // Acme Visayas — intentionally NOT connected (empty-state demo).

  // Non-subaccount standard-account demo state — one connected store.
  {
    accountId: STANDARD_ACCOUNT_ID,
    accountName: 'Your Store',
    storeName: 'GoGo Merch Store',
    storeDomain: 'gogo-merch.myshopify.com',
    status: 'connected',
    lastSyncAt: '2026-06-10 10:05 AM',
    connectedBy: 'Max Rodriguez',
    connectedAt: '2026-05-01',
    syncHealth: 'healthy',
    pendingPickups: 2,
    monthlyBookings: 12,
    failedRequests: 0,
  },
];

// ─── Sync logs ────────────────────────────────────────────────────────────────
//
// Newest-first activity history between Shopify and GGX. Includes success,
// warning, and failed events across the connected stores.

export const syncLogs: SyncLog[] = [
  // Acme Luzon — warning/failed activity (drives its 'warning' health).
  {
    id: 'SYNC-2026-0042',
    timestamp: '2026-06-10 08:15 AM',
    storeName: 'Acme Luzon Online',
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    event: 'auth_error',
    status: 'warning',
    message: 'Plugin authentication token expiring in 3 days. Re-authenticate to avoid sync interruption.',
  },
  {
    id: 'SYNC-2026-0041',
    timestamp: '2026-06-10 07:58 AM',
    storeName: 'Acme Luzon Online',
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    event: 'pickup_request_failed',
    status: 'failed',
    message: 'Pickup request failed because the delivery address is incomplete (missing barangay).',
    referenceNumber: 'SH-1042',
  },
  {
    id: 'SYNC-2026-0040',
    timestamp: '2026-06-10 07:40 AM',
    storeName: 'Acme Luzon Online',
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    event: 'order_synced',
    status: 'success',
    message: 'Order synced successfully from Shopify.',
    referenceNumber: 'SH-1041',
  },
  {
    id: 'SYNC-2026-0039',
    timestamp: '2026-06-10 07:22 AM',
    storeName: 'Acme Luzon Online',
    accountId: 'acme-luzon',
    accountName: 'Acme Luzon',
    event: 'pickup_request_sent',
    status: 'success',
    message: 'Pickup request sent to GGX for booking.',
    referenceNumber: 'GGX-2026-90009',
  },
  // Acme Corporation — healthy activity.
  {
    id: 'SYNC-2026-0038',
    timestamp: '2026-06-10 09:42 AM',
    storeName: 'Acme Corporation Store',
    accountId: 'acme-corporation',
    accountName: 'Acme Corporation',
    event: 'tracking_pushed',
    status: 'success',
    message: 'Tracking and status update pushed back to Shopify.',
    referenceNumber: 'GGX-2026-90010',
  },
  {
    id: 'SYNC-2026-0037',
    timestamp: '2026-06-10 09:18 AM',
    storeName: 'Acme Corporation Store',
    accountId: 'acme-corporation',
    accountName: 'Acme Corporation',
    event: 'pickup_request_sent',
    status: 'success',
    message: 'Pickup request sent to GGX for booking.',
    referenceNumber: 'GGX-2026-90010',
  },
  {
    id: 'SYNC-2026-0036',
    timestamp: '2026-06-10 09:05 AM',
    storeName: 'Acme Corporation Store',
    accountId: 'acme-corporation',
    accountName: 'Acme Corporation',
    event: 'order_synced',
    status: 'success',
    message: 'Order synced successfully from Shopify.',
    referenceNumber: 'SH-2087',
  },
  {
    id: 'SYNC-2026-0035',
    timestamp: '2026-03-14 02:30 PM',
    storeName: 'Acme Corporation Store',
    accountId: 'acme-corporation',
    accountName: 'Acme Corporation',
    event: 'store_connected',
    status: 'success',
    message: 'Shopify store connected to Acme Corporation.',
  },
  // Standard-account store — healthy activity.
  {
    id: 'SYNC-2026-0034',
    timestamp: '2026-06-10 10:05 AM',
    storeName: 'GoGo Merch Store',
    accountId: STANDARD_ACCOUNT_ID,
    accountName: 'Your Store',
    event: 'order_synced',
    status: 'success',
    message: 'Order synced successfully from Shopify.',
    referenceNumber: 'SH-5510',
  },
  {
    id: 'SYNC-2026-0033',
    timestamp: '2026-06-10 09:50 AM',
    storeName: 'GoGo Merch Store',
    accountId: STANDARD_ACCOUNT_ID,
    accountName: 'Your Store',
    event: 'pickup_request_sent',
    status: 'success',
    message: 'Pickup request sent to GGX for booking.',
    referenceNumber: 'GGX-2026-90021',
  },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

/** Resolve the connected store for a given account/subaccount id (or undefined). */
export function getStoreByAccountId(accountId: string | undefined): ConnectedStore | undefined {
  if (!accountId || accountId === MAIN_ACCOUNT_ID) return undefined;
  return connectedStores.find((s) => s.accountId === accountId);
}
