/**
 * Mock data for the notification service layer.
 *
 * Re-exports `data/notifications.ts` helpers so the service layer has a
 * single import point. Future: replace with GET /notifications and
 * PATCH /notifications/:id/read calls.
 *
 * The existing module already handles:
 * - Account/subaccount visibility scoping via `NotificationViewer`
 * - Seed + runtime notification merge
 * - Read-state persistence via localStorage
 * - Category metadata for UI rendering
 */

export {
  type AppNotification,
  type NotificationCategory,
  type NotificationScope,
  type NotificationViewer,
  CATEGORY_META,
  pushNotification,
  getAllNotifications,
  getVisibleNotifications,
  getVisibleUnreadCount,
  markVisibleNotificationsRead,
  markAllNotificationsRead,
  useNotificationViewer,
  relativeTime,
} from '../notifications';
