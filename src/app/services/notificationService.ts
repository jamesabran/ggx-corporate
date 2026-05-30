/**
 * notificationService — notification retrieval, read-state, and visibility.
 *
 * All functions are async to match a real API contract.
 * Currently backed by `data/notifications.ts` (module-level state + localStorage).
 *
 * Visibility scoping is delegated to the existing `NotificationViewer` model in
 * `data/notifications.ts`; the service layer wraps it for consistent call patterns.
 *
 * Future API endpoints:
 *   GET   /notifications             → getNotifications
 *   GET   /notifications/unread/count → getUnreadCount
 *   PATCH /notifications/:id/read    → markNotificationRead
 *   PATCH /notifications/read-all    → markAllNotificationsRead
 *   POST  /notifications             → pushNotification (internal only)
 */

import {
  type AppNotification,
  type NotificationCategory,
  type NotificationScope,
  type NotificationViewer,
  getAllNotifications,
  getVisibleNotifications,
  getVisibleUnreadCount,
  markVisibleNotificationsRead,
  markAllNotificationsRead as markAllSync,
  pushNotification as pushSync,
  relativeTime,
} from '../data/notifications';

export type {
  AppNotification,
  NotificationCategory,
  NotificationScope,
  NotificationViewer,
};

export interface NotificationContext {
  viewer: NotificationViewer;
}

export interface NotificationFilters {
  category?: NotificationCategory | 'all';
  unreadOnly?: boolean;
}

/** Return all notifications visible to the given viewer, with optional filters. */
export async function getNotifications(
  context: NotificationContext,
  filters?: NotificationFilters
): Promise<AppNotification[]> {
  let items = getVisibleNotifications(context.viewer);
  if (filters?.category && filters.category !== 'all') {
    items = items.filter((n) => n.category === filters.category);
  }
  if (filters?.unreadOnly) {
    items = items.filter((n) => !n.read);
  }
  return items;
}

/** Return the unread notification count for the given viewer. */
export async function getUnreadCount(context: NotificationContext): Promise<number> {
  return getVisibleUnreadCount(context.viewer);
}

/**
 * Mark a single notification as read by id.
 * Note: The current sync model marks all-visible at once; single-id marking
 * is a no-op upgrade path that documents the future API shape.
 */
export async function markNotificationRead(_notificationId: string): Promise<void> {
  // Deferred: individual read-marking requires a per-id state store.
  // Current model: all visible notifications are marked read when the bell is opened.
}

/** Mark all notifications as read (global, ignores viewer scope). */
export async function markAllNotificationsRead(
  _context?: NotificationContext
): Promise<void> {
  markAllSync();
}

/** Mark all visible notifications as read (alias for compatibility). */
export async function markVisibleRead(context: NotificationContext): Promise<void> {
  markVisibleNotificationsRead(context.viewer);
}

/**
 * Push a new notification into the runtime store.
 * Used by claims, SLA, bulk uploads, financial changes, and support tickets.
 */
export async function pushNotification(
  input: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & {
    id?: string;
    timestamp?: string;
    read?: boolean;
  }
): Promise<void> {
  pushSync(input);
}

/** Return all raw notifications (no viewer scoping — Admin-only use). */
export async function getAllNotificationsAdmin(): Promise<AppNotification[]> {
  return getAllNotifications();
}

/** Return a human-readable relative timestamp. */
export function formatNotificationTime(isoTimestamp: string): string {
  return relativeTime(isoTimestamp);
}
