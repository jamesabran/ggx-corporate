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
  connectedStores,
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

/** Connection-health presentation for the coverage view. */
export const HEALTH_META: Record<ConnectedStore['syncHealth'], {
  label: string;
  variant: 'success' | 'warning' | 'danger';
}> = {
  healthy: { label: 'Healthy', variant: 'success' },
  warning: { label: 'Needs Attention', variant: 'warning' },
  error:   { label: 'Sync Error', variant: 'danger' },
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

/** Summary counts for the Shopify Overview, optionally scoped to one account. */
export interface ShopifyOverviewStats {
  connectedStores: number;
  ordersSynced: number;
  pickupsRequested: number;
  syncIssues: number;
}

export async function getShopifyOverviewStats(accountId?: string): Promise<ShopifyOverviewStats> {
  const scoped = accountId && accountId !== 'main';
  const stores = scoped
    ? connectedStores.filter((s) => s.accountId === accountId)
    : connectedStores.filter((s) => s.accountId !== STANDARD_ACCOUNT_ID || !accountId);
  const logs = scoped ? syncLogs.filter((l) => l.accountId === accountId) : syncLogs;
  return {
    connectedStores: stores.length,
    ordersSynced: logs.filter((l) => l.event === 'order_synced' && l.status === 'success').length,
    pickupsRequested: logs.filter((l) => l.event === 'pickup_request_sent').length,
    syncIssues: logs.filter((l) => l.status === 'failed' || l.status === 'warning').length,
  };
}
