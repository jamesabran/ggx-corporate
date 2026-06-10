/**
 * Shopify integration service facade.
 *
 * Contract between the Shopify UI and the BFF. Currently backed by mock data
 * (`data/shopify.ts`). Future: replace each body with fetch() calls to:
 *   GET  /integrations/shopify/store?accountId=X   → getConnectedStore
 *   GET  /integrations/shopify/coverage            → getStoreCoverage
 *   GET  /integrations/shopify/sync-logs           → getSyncLogs
 *
 * Scoping rules (account-context aware) are applied by the caller via the
 * resolved scope id (see useScopedAccountId): managers and drilled-in admins
 * pass their subaccount id; Main Account admins request the coverage list.
 *
 * Connection status, last-sync timestamps, and sync events are backend/source-
 * system owned. The frontend only presents and filters them.
 */

import {
  syncLogs,
  getStoreByAccountId,
  STANDARD_ACCOUNT_ID,
  type ConnectedStore,
  type SyncLog,
  type SyncStatus,
  type SyncEventType,
} from '../data/shopify';
import {
  IconPlugConnected, IconPackageImport, IconTruckDelivery,
  IconAlertTriangle, IconRefresh, IconPlugConnectedX, IconLock,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type { ConnectedStore, SyncLog, SyncStatus, SyncEventType };
export { STANDARD_ACCOUNT_ID };

/** The Shopify app listing the primary CTA links to. */
export const SHOPIFY_APP_URL = 'https://apps.shopify.com/gogo-xpress-beta';

// ─── presentation meta ────────────────────────────────────────────────────────

export const SYNC_STATUS_META: Record<SyncStatus, {
  label: string;
  variant: 'success' | 'danger' | 'warning';
}> = {
  success: { label: 'Success', variant: 'success' },
  failed:  { label: 'Failed',  variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
};

export const SYNC_EVENT_META: Record<SyncEventType, {
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = {
  store_connected:      { label: 'Store Connected',       icon: IconPlugConnected },
  order_synced:         { label: 'Order Synced',          icon: IconPackageImport },
  pickup_request_sent:  { label: 'Pickup Request Sent',   icon: IconTruckDelivery },
  pickup_request_failed:{ label: 'Pickup Request Failed', icon: IconAlertTriangle },
  tracking_pushed:      { label: 'Tracking Update Pushed',icon: IconRefresh },
  store_disconnected:   { label: 'Store Disconnected',    icon: IconPlugConnectedX },
  auth_error:           { label: 'Authentication Error',  icon: IconLock },
};

/** Store status label shown on scoped Overview + coverage. */
export type StoreStatusLabel = 'Connected' | 'Needs attention' | 'Disconnected';

/** Resolve a connected store to its product-facing status label. */
export function getStoreStatusLabel(store: ConnectedStore): StoreStatusLabel {
  if (store.status === 'error' || store.syncHealth === 'error') return 'Disconnected';
  if (store.syncHealth === 'warning') return 'Needs attention';
  return 'Connected';
}

/** Presentation meta for a store status label (badge variant + accent). */
export const STORE_STATUS_META: Record<StoreStatusLabel, {
  variant: 'success' | 'warning' | 'danger';
  color: string;
  bg: string;
}> = {
  'Connected':       { variant: 'success', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Needs attention': { variant: 'warning', color: 'text-amber-600',   bg: 'bg-amber-50' },
  'Disconnected':    { variant: 'danger',  color: 'text-red-600',     bg: 'bg-red-50' },
};

// ─── service functions ──────────────────────────────────────────────────────────

/**
 * Return the connected Shopify store for a given account/subaccount id, or null
 * when none is connected. Pass STANDARD_ACCOUNT_ID for the non-subaccount
 * standard-account context.
 */
export async function getConnectedStore(accountId: string | undefined): Promise<ConnectedStore | null> {
  return getStoreByAccountId(accountId) ?? null;
}

/** A coverage row: an account/subaccount and its connected store (or null). */
export interface StoreCoverageRow {
  accountId: string;
  accountName: string;
  store: ConnectedStore | null;
}

/**
 * Return Shopify connection coverage across the supplied accounts/subaccounts
 * (Main Account view). Rows with no store carry `store: null` so the UI can
 * show a "No store connected" state with a connect CTA.
 */
export async function getStoreCoverage(
  accounts: { id: string; name: string }[]
): Promise<StoreCoverageRow[]> {
  return accounts.map((a) => ({
    accountId: a.id,
    accountName: a.name,
    store: getStoreByAccountId(a.id) ?? null,
  }));
}

export interface SyncLogFilters {
  /** Scope to a single account/subaccount id. Omit / 'main' for all. */
  accountId?: string;
  status?: SyncStatus | 'all';
  search?: string;
}

/** Return sync logs (newest-first), optionally scoped and filtered. */
export async function getSyncLogs(filters?: SyncLogFilters): Promise<SyncLog[]> {
  let result = [...syncLogs];
  const { accountId, status, search } = filters ?? {};
  if (accountId && accountId !== 'all' && accountId !== 'main') {
    result = result.filter((l) => l.accountId === accountId);
  }
  if (status && status !== 'all') {
    result = result.filter((l) => l.status === status);
  }
  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.message.toLowerCase().includes(q) ||
        l.storeName.toLowerCase().includes(q) ||
        (l.referenceNumber?.toLowerCase().includes(q) ?? false)
    );
  }
  return result;
}

// ─── Overview metrics ─────────────────────────────────────────────────────────
//
// Transactional-activity focused (NOT generic technical health). All counts are
// backend-provided rollups (treated as BFF-supplied), not UI-computed.

/** Main Account metrics: store coverage + aggregate pickup activity across subaccounts. */
export interface MainShopifyMetrics {
  connectedStores: number;
  pendingPickups: number;
  shopifyBookings: number;
  failedPickupRequests: number;
}

/** Scoped (subaccount / standard) metrics for a connected store. */
export interface ScopedShopifyMetrics {
  storeStatus: StoreStatusLabel;
  pendingPickups: number;
  shopifyBookings: number;
  failedPickupRequests: number;
}

/**
 * Aggregate Shopify metrics across the supplied accounts/subaccounts (Main
 * Account view). Sums each connected store's backend-provided rollups.
 */
export async function getMainShopifyMetrics(
  accounts: { id: string; name: string }[]
): Promise<MainShopifyMetrics> {
  const stores = accounts
    .map((a) => getStoreByAccountId(a.id))
    .filter((s): s is ConnectedStore => !!s);
  return {
    connectedStores: stores.length,
    pendingPickups: stores.reduce((n, s) => n + s.pendingPickups, 0),
    shopifyBookings: stores.reduce((n, s) => n + s.monthlyBookings, 0),
    failedPickupRequests: stores.reduce((n, s) => n + s.failedRequests, 0),
  };
}

/**
 * Scoped metrics for a single account/subaccount's connected store.
 * Returns null when no store is connected (caller shows the empty state).
 */
export async function getScopedShopifyMetrics(
  accountId: string | undefined
): Promise<ScopedShopifyMetrics | null> {
  const s = getStoreByAccountId(accountId);
  if (!s) return null;
  return {
    storeStatus: getStoreStatusLabel(s),
    pendingPickups: s.pendingPickups,
    shopifyBookings: s.monthlyBookings,
    failedPickupRequests: s.failedRequests,
  };
}
