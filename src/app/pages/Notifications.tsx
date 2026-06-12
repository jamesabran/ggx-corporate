import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconBell, IconCircleCheck } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
// Notification data reads/writes go through the notificationService facade.
// `useNotificationViewer` (a React hook) and `CATEGORY_META` (presentation
// config) legitimately stay in data/notifications — they are not data access.
import {
  getNotifications, markVisibleRead, formatNotificationTime,
  type AppNotification, type NotificationCategory,
} from '../services/notificationService';
import { useNotificationViewer, CATEGORY_META } from '../data/notifications';
import { approveAddon } from '../services/addonsService';

type TabKey = 'all' | NotificationCategory;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',              label: 'All' },
  { key: 'bulk_upload',      label: 'Bulk Uploads' },
  { key: 'transaction',      label: 'Transactions' },
  { key: 'account',          label: 'Account' },
  { key: 'service_advisory', label: 'Service' },
  { key: 'report',           label: 'Reports' },
  { key: 'support',          label: 'Support' },
];

function NotificationRow({
  n,
  onClick,
  onReload,
}: {
  n: AppNotification;
  onClick: (n: AppNotification) => void;
  onReload: () => void;
}) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  const addon = n.meta?.addon;
  const clickable = !!n.href && !addon;

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!addon) return;
    approveAddon(addon.moduleId, addon.accountId, addon.accountLabel);
    onReload();
  };

  return (
    <div
      className={`flex items-start gap-3 px-5 py-3.5 ${!n.read ? 'bg-blue-50/40' : ''}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bgClass}`}>
        <Icon className={`w-4 h-4 ${meta.iconClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{meta.label}</span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
        </div>
        <button
          type="button"
          disabled={!clickable}
          onClick={clickable ? () => onClick(n) : undefined}
          className={`w-full text-left ${clickable ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
        >
          <p className={`text-sm leading-snug ${n.read ? 'text-gray-800' : 'text-gray-900 font-medium'}`}>{n.title}</p>
          {n.scope === 'subaccount' && n.accountName && (
            <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 mt-0.5 mb-0.5">
              {n.accountName}
            </span>
          )}
          <p className="text-sm text-gray-500 leading-snug mt-0.5">{n.body}</p>
        </button>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <p className="text-xs text-gray-400">{formatNotificationTime(n.timestamp)}</p>
          {addon && (
            <Button size="sm" variant="outline" onClick={handleApprove} className="h-6 text-xs px-2.5 gap-1">
              <IconCircleCheck className="w-3.5 h-3.5 text-green-600" />
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Notifications() {
  const navigate = useNavigate();
  const viewer = useNotificationViewer();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [seq, setSeq] = useState(0);

  const reload = useCallback(() => setSeq((s) => s + 1), []);

  useEffect(() => {
    let cancelled = false;
    getNotifications({ viewer }).then((list) => {
      if (cancelled) return;
      setItems(list.map((n) => ({ ...n })));
      markVisibleRead({ viewer });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, seq]);

  const unreadFor = (key: TabKey) =>
    (key === 'all' ? items : items.filter((n) => n.category === key)).filter((n) => !n.read).length;

  const visibleItems = activeTab === 'all' ? items : items.filter((n) => n.category === activeTab);

  const handleClick = useCallback((n: AppNotification) => { if (n.href) navigate(n.href); }, [navigate]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Account, upload, delivery, and service updates
          {viewer.accountName !== 'all' && <span className="text-gray-500"> · {viewer.accountName}</span>}
        </p>
      </div>

      {/* Tabs — DS segmented tablist (matches Shopify / API Integration) */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="h-auto flex-wrap gap-1">
          {TABS.map((tab) => {
            const unread = unreadFor(tab.key);
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                {tab.label}
                {unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold rounded-full bg-gray-200 text-gray-600">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* List */}
      {visibleItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <IconBell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'all'
                ? 'Important account, upload, and delivery updates will appear here.'
                : 'There are no notifications in this category.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {visibleItems.map((n) => (
              <NotificationRow key={n.id} n={n} onClick={handleClick} onReload={reload} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
