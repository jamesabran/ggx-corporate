import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconBell } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  getAllNotifications, markAllNotificationsRead, CATEGORY_META, relativeTime,
  type AppNotification, type NotificationCategory,
} from '../data/notifications';

// Display order groups batch + transaction (operational) first, then account,
// service, report, and support.
const CATEGORY_ORDER: NotificationCategory[] = [
  'bulk_upload', 'transaction', 'service_advisory', 'account', 'report', 'support',
];

export function Notifications() {
  const navigate = useNavigate();
  // Snapshot once so read-state mutation on mount doesn't reshuffle the view.
  const [items] = useState<AppNotification[]>(() => getAllNotifications().map((n) => ({ ...n })));

  // Visiting the page counts as viewing — clear unread.
  useEffect(() => { markAllNotificationsRead(); }, []);

  const groups = CATEGORY_ORDER
    .map((cat) => ({ cat, list: items.filter((n) => n.category === cat) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Account, upload, delivery, and service updates for your GGX Corporate account.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <IconBell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No new notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              Important account, upload, and delivery updates will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map(({ cat, list }) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                <h2 className="text-sm font-semibold text-gray-900">{meta.label}</h2>
                <span className="text-xs text-gray-400">({list.length})</span>
              </div>
              <Card>
                <CardContent className="p-0 divide-y divide-gray-100">
                  {list.map((n) => {
                    const clickable = !!n.href;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        disabled={!clickable}
                        onClick={clickable ? () => navigate(n.href!) : undefined}
                        className={`w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors ${
                          clickable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bgClass}`}>
                          <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                          <p className="text-xs text-gray-400 mt-1">{relativeTime(n.timestamp)}</p>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}
