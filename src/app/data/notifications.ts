// Unified notification model for GGX Corporate (frontend/mock only).
//
// Notifications are categorized so corporate/admin users can distinguish
// batch-level upload events from order-level transactional updates, account
// changes, service advisories, reports, and support.
//
// This model is intentionally future-ready:
//   - `support` notifications are seeded as mock only; a future prompt can wire
//     them to Submit Ticket / Zendesk without changing this shape.
//   - `report` notifications can later link to a real downloads/reports page.
//   - Bulk upload events are sourced live from `bulkUploads.ts`.

import type { ComponentType } from 'react';
import {
  IconUpload, IconPackage, IconUserCog, IconAlertTriangle, IconFileText, IconMessage,
} from '@tabler/icons-react';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { PENDING_NOTIFICATIONS, type UploadNotificationEvent } from './bulkUploads';

export type NotificationCategory =
  | 'bulk_upload'      // Bulk Upload / Batch Processing
  | 'transaction'      // Transactional / Order Status Updates
  | 'account'          // Account Updates
  | 'service_advisory' // Service Advisories
  | 'report'           // Reports / Downloads
  | 'support';         // Support Tickets (future Zendesk)

// Audience scope for account/subaccount visibility:
//   global     — everyone (e.g. nationwide service advisory)
//   parent     — parent/main-account level, Admin-only (e.g. billing, reports)
//   subaccount — tied to one subaccount (accountName set); Admin + that Manager
export type NotificationScope = 'global' | 'parent' | 'subaccount';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** ISO timestamp. */
  timestamp: string;
  read: boolean;
  /** Audience scope for account/subaccount visibility filtering. */
  scope: NotificationScope;
  /** Subaccount name this item belongs to (required when scope === 'subaccount'). */
  accountName?: string;
  /** Navigation target. Omit for informational-only items (non-clickable). */
  href?: string;
  /** Optional related-entity metadata, populated when applicable. */
  meta?: {
    batchId?: string;
    trackingNumber?: string;
    ticketId?: string;
    reportId?: string;
  };
}

export interface CategoryMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
}

// Subtle, functional category styling — icons differentiate without shouting.
export const CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
  bulk_upload:      { label: 'Bulk Upload', icon: IconUpload,        iconClass: 'text-blue-600',    bgClass: 'bg-blue-50' },
  transaction:      { label: 'Transaction', icon: IconPackage,       iconClass: 'text-indigo-600',  bgClass: 'bg-indigo-50' },
  account:          { label: 'Account',     icon: IconUserCog,       iconClass: 'text-violet-600',  bgClass: 'bg-violet-50' },
  service_advisory: { label: 'Service',     icon: IconAlertTriangle, iconClass: 'text-amber-600',   bgClass: 'bg-amber-50' },
  report:           { label: 'Report',      icon: IconFileText,      iconClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
  support:          { label: 'Support',     icon: IconMessage,       iconClass: 'text-gray-600',    bgClass: 'bg-gray-100' },
};

// Relative timestamp offsets (minutes ago) so the mock list reads naturally.
const minsAgo = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

// Module-level mock seed (mutable so "mark read" persists for the tab session).
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-txn-1', category: 'transaction',
    title: 'Delivery exception reported',
    body: 'GGX-2024-89231 could not be delivered — recipient unavailable. Action may be required.',
    timestamp: minsAgo(35), read: false,
    scope: 'subaccount', accountName: 'Acme Corporation',
    href: '/dashboard/transactions/GGX-2024-89231', meta: { trackingNumber: 'GGX-2024-89231' },
  },
  {
    id: 'ntf-txn-2', category: 'transaction',
    title: 'Pickup scheduled',
    body: '14 orders are scheduled for pickup tomorrow at 9:00 AM.',
    timestamp: minsAgo(180), read: false,
    scope: 'subaccount', accountName: 'Acme Luzon',
    href: '/dashboard/transactions',
  },
  {
    id: 'ntf-acct-1', category: 'account',
    title: 'New manager access added',
    body: 'Rina Lopez was granted Manager access to Acme Luzon.',
    timestamp: minsAgo(300), read: false,
    // Directly relevant to the assigned Manager, so subaccount-scoped (not parent-only).
    scope: 'subaccount', accountName: 'Acme Luzon',
    href: '/dashboard/users-permissions',
  },
  {
    id: 'ntf-acct-2', category: 'account',
    title: 'Billing contract updated',
    body: 'Billing terms for Acme Corporation were updated by your account manager.',
    timestamp: minsAgo(1500), read: true,
    // Finance/billing is handled at the parent level → Admin-only.
    scope: 'parent',
    href: '/dashboard/billing',
  },
  {
    id: 'ntf-svc-1', category: 'service_advisory',
    title: 'Pickup cutoff advisory',
    body: 'Same-day pickup cutoff moves to 9:00 AM on June 12 due to holiday volume.',
    timestamp: minsAgo(600), read: false,
    scope: 'global',
    href: '/dashboard/advisories',
  },
  {
    id: 'ntf-svc-2', category: 'service_advisory',
    title: 'Temporary service delay in selected areas',
    body: 'Deliveries to parts of Cebu may be delayed due to weather conditions.',
    timestamp: minsAgo(2880), read: true,
    scope: 'global',
    href: '/dashboard/advisories',
  },
  {
    id: 'ntf-rpt-1', category: 'report',
    title: 'Monthly billing report is ready',
    body: 'Your May 2026 billing report is available to download.',
    timestamp: minsAgo(720), read: false,
    // Reports/finance are parent-level → Admin-only.
    scope: 'parent',
    href: '/dashboard/reports', meta: { reportId: 'RPT-2026-05' },
  },
  {
    id: 'ntf-sup-1', category: 'support',
    title: 'Support ticket update',
    body: 'Ticket TCK-1043 has a new response from the support team.',
    timestamp: minsAgo(1440), read: true,
    scope: 'subaccount', accountName: 'Acme Corporation',
    href: '/dashboard/support-tickets/TCK-1043', meta: { ticketId: 'TCK-1043' },
  },
];

// Runtime notifications pushed during the session (e.g. a submitted support
// ticket). Kept separate from the seed so other modules can add notifications
// without importing the mock array. This is the extension point future sources
// (Zendesk, reports, advisories) should use.
const RUNTIME_NOTIFICATIONS: AppNotification[] = [];

/** Push a new notification for the current session (newest first). */
export function pushNotification(
  input: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: string; read?: boolean },
): void {
  RUNTIME_NOTIFICATIONS.unshift({
    id: input.id ?? `ntf-rt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: input.timestamp ?? new Date().toISOString(),
    read: input.read ?? false,
    category: input.category,
    title: input.title,
    body: input.body,
    scope: input.scope,
    accountName: input.accountName,
    href: input.href,
    meta: input.meta,
  });
}

/** Convert a live Bulk Upload event into a unified notification. */
function uploadEventToNotification(e: UploadNotificationEvent): AppNotification {
  const clean = e.errorRows === 0;
  return {
    id: e.id,
    category: 'bulk_upload',
    title: clean ? 'Bulk upload completed successfully' : 'Bulk upload is ready for review',
    body: clean
      ? `${e.fileName} finished processing with ${e.validRows} valid orders.`
      : `${e.fileName} finished processing. ${e.validRows} valid orders, ${e.errorRows} rows need review.`,
    timestamp: e.timestamp,
    read: e.read,
    // Batch-level: belongs to a subaccount. Live events don't yet carry the
    // uploading subaccount, so accountName is left undefined — visible to Admin
    // in the All-Accounts view (see assumptions in IMPLEMENTATION_LOG).
    scope: 'subaccount',
    accountName: e.accountName,
    href: `/dashboard/bulk-uploader/summary/${e.batchId}`,
    meta: { batchId: e.batchId },
  };
}

/** All notifications (live upload events + runtime + mock seed), newest first. */
export function getAllNotifications(): AppNotification[] {
  const uploads = PENDING_NOTIFICATIONS.map(uploadEventToNotification);
  return [...uploads, ...RUNTIME_NOTIFICATIONS, ...MOCK_NOTIFICATIONS]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Count of unread notifications (drives the bell red dot). */
export function getUnreadCount(): number {
  const uploadsUnread = PENDING_NOTIFICATIONS.filter((e) => !e.read).length;
  const runtimeUnread = RUNTIME_NOTIFICATIONS.filter((n) => !n.read).length;
  const mockUnread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  return uploadsUnread + runtimeUnread + mockUnread;
}

/** Mark every notification read (called when the bell popover / page opens). */
export function markAllNotificationsRead(): void {
  MOCK_NOTIFICATIONS.forEach((n) => { n.read = true; });
  RUNTIME_NOTIFICATIONS.forEach((n) => { n.read = true; });
  PENDING_NOTIFICATIONS.forEach((e) => { e.read = true; });
}

// ---------------------------------------------------------------------------
// Account-scope visibility
// ---------------------------------------------------------------------------

export interface NotificationViewer {
  role: 'admin' | 'manager';
  /** 'all' for an Admin on the Main/All-Accounts view; otherwise a subaccount name. */
  accountName: string;
}

/**
 * Derive the current viewer from SubAccountContext.
 *
 * The demo user (Max Rodriguez) is the account Admin — there is no separate
 * Manager login in the app, so role is always 'admin' here. The Manager branch
 * of `isNotificationVisible` is implemented and would activate for a real
 * Manager session (documented assumption).
 *
 * - Subaccounts disabled, or Main-Account view, or currentAccount === 'main'
 *   → Admin sees ALL accounts.
 * - Admin drilled into a specific subaccount → scoped to that subaccount.
 */
export function useNotificationViewer(): NotificationViewer {
  const { subAccountsEnabled, currentAccount, getCurrentAccountName, isMainAccountView } = useSubAccounts();
  const accountName =
    !subAccountsEnabled || isMainAccountView() || currentAccount === 'main'
      ? 'all'
      : getCurrentAccountName();
  return { role: 'admin', accountName };
}

/** Whether a notification is visible to the given viewer. */
export function isNotificationVisible(n: AppNotification, viewer: NotificationViewer): boolean {
  // Global advisories are visible to everyone.
  if (n.scope === 'global') return true;

  if (viewer.role === 'admin') {
    // Parent Admin on All-Accounts view sees everything.
    if (viewer.accountName === 'all') return true;
    // Admin drilled into a subaccount: parent-level items + that subaccount's items.
    if (n.scope === 'parent') return true;
    return n.accountName === viewer.accountName;
  }

  // Manager: only their assigned subaccount; never parent-level items.
  if (n.scope === 'parent') return false;
  return n.accountName === viewer.accountName;
}

/** Visible notifications for the viewer (newest first). */
export function getVisibleNotifications(viewer: NotificationViewer): AppNotification[] {
  return getAllNotifications().filter((n) => isNotificationVisible(n, viewer));
}

/** Count of unread *visible* notifications (drives the bell badge). */
export function getVisibleUnreadCount(viewer: NotificationViewer): number {
  return getVisibleNotifications(viewer).filter((n) => !n.read).length;
}

/** Mark only the viewer's visible notifications as read. */
export function markVisibleNotificationsRead(viewer: NotificationViewer): void {
  PENDING_NOTIFICATIONS.forEach((e) => {
    if (isNotificationVisible(uploadEventToNotification(e), viewer)) e.read = true;
  });
  RUNTIME_NOTIFICATIONS.forEach((n) => { if (isNotificationVisible(n, viewer)) n.read = true; });
  MOCK_NOTIFICATIONS.forEach((n) => { if (isNotificationVisible(n, viewer)) n.read = true; });
}

/** Compact relative-time label. */
export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
