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
import { PENDING_NOTIFICATIONS, type UploadNotificationEvent } from './bulkUploads';

export type NotificationCategory =
  | 'bulk_upload'      // Bulk Upload / Batch Processing
  | 'transaction'      // Transactional / Order Status Updates
  | 'account'          // Account Updates
  | 'service_advisory' // Service Advisories
  | 'report'           // Reports / Downloads
  | 'support';         // Support Tickets (future Zendesk)

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** ISO timestamp. */
  timestamp: string;
  read: boolean;
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
    href: '/dashboard/transactions/GGX-2024-89231', meta: { trackingNumber: 'GGX-2024-89231' },
  },
  {
    id: 'ntf-txn-2', category: 'transaction',
    title: 'Pickup scheduled',
    body: '14 orders are scheduled for pickup tomorrow at 9:00 AM.',
    timestamp: minsAgo(180), read: false,
    href: '/dashboard/transactions',
  },
  {
    id: 'ntf-acct-1', category: 'account',
    title: 'New manager access added',
    body: 'Rina Lopez was granted Manager access to Acme Luzon.',
    timestamp: minsAgo(300), read: false,
    href: '/dashboard/users-permissions',
  },
  {
    id: 'ntf-acct-2', category: 'account',
    title: 'Billing contract updated',
    body: 'Billing terms for Acme Corporation were updated by your account manager.',
    timestamp: minsAgo(1500), read: true,
    href: '/dashboard/billing',
  },
  {
    id: 'ntf-svc-1', category: 'service_advisory',
    title: 'Pickup cutoff advisory',
    body: 'Same-day pickup cutoff moves to 9:00 AM on June 12 due to holiday volume.',
    timestamp: minsAgo(600), read: false,
    // Informational — no link.
  },
  {
    id: 'ntf-svc-2', category: 'service_advisory',
    title: 'Temporary service delay in selected areas',
    body: 'Deliveries to parts of Cebu may be delayed due to weather conditions.',
    timestamp: minsAgo(2880), read: true,
  },
  {
    id: 'ntf-rpt-1', category: 'report',
    title: 'Monthly billing report is ready',
    body: 'Your May 2026 billing report is available to download.',
    timestamp: minsAgo(720), read: false,
    href: '/dashboard/reports', meta: { reportId: 'RPT-2026-05' },
  },
  {
    id: 'ntf-sup-1', category: 'support',
    title: 'Support ticket update',
    body: 'Ticket TCK-1043 has a new response from the support team.',
    timestamp: minsAgo(1440), read: true,
    href: '/dashboard/support-tickets', meta: { ticketId: 'TCK-1043' },
  },
];

/** Convert a live Bulk Upload event into a unified notification. */
function uploadEventToNotification(e: UploadNotificationEvent): AppNotification {
  const clean = e.errorRows === 0;
  return {
    id: e.id,
    category: 'bulk_upload',
    title: clean ? 'Bulk upload completed successfully' : 'Bulk upload is ready for review',
    body: clean
      ? `${e.fileName} finished processing. ${e.validRows} valid orders ready.`
      : `${e.fileName} finished processing. ${e.validRows} valid orders, ${e.errorRows} rows need review.`,
    timestamp: e.timestamp,
    read: e.read,
    href: `/dashboard/bulk-uploader/summary/${e.batchId}`,
    meta: { batchId: e.batchId },
  };
}

/** All notifications (live upload events + mock seed), newest first. */
export function getAllNotifications(): AppNotification[] {
  const uploads = PENDING_NOTIFICATIONS.map(uploadEventToNotification);
  return [...uploads, ...MOCK_NOTIFICATIONS].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Count of unread notifications (drives the bell red dot). */
export function getUnreadCount(): number {
  const uploadsUnread = PENDING_NOTIFICATIONS.filter((e) => !e.read).length;
  const mockUnread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  return uploadsUnread + mockUnread;
}

/** Mark every notification read (called when the bell popover / page opens). */
export function markAllNotificationsRead(): void {
  MOCK_NOTIFICATIONS.forEach((n) => { n.read = true; });
  PENDING_NOTIFICATIONS.forEach((e) => { e.read = true; });
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
