import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  IconExternalLink, IconPlugConnected, IconBuildingStore,
  IconWorld, IconUser, IconRefresh, IconCircleCheck, IconAlertTriangle,
  IconPlus, IconBook, IconTruck, IconPackageImport, IconInfoCircle,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button, buttonVariants } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/SearchInput';
import { StatCard } from '../components/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { useScopedAccountId } from '../hooks/useAccountScope';
import {
  getConnectedStore, getStoreCoverage, getSyncLogs, getShopifyOverviewStats,
  SYNC_STATUS_META, SYNC_EVENT_META, HEALTH_META, SHOPIFY_APP_URL, STANDARD_ACCOUNT_ID,
  type ConnectedStore, type StoreCoverageRow, type SyncLog, type SyncStatus,
  type ShopifyOverviewStats,
} from '../services/shopifyService';

// ─── shared external-link CTA (anchor styled as a Button) ──────────────────────

function ShopifyAppLink({
  label, variant = 'default', className,
}: { label: string; variant?: 'default' | 'outline'; className?: string }) {
  return (
    <a
      href={SHOPIFY_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size: 'default' }), className)}
    >
      <IconBuildingStore className="w-4 h-4" />
      {label}
      <IconExternalLink className="w-3.5 h-3.5 opacity-70" />
    </a>
  );
}

// ─── Connected Store: empty state ──────────────────────────────────────────────

function StoreEmptyState({ accountName }: { accountName: string }) {
  return (
    <Card>
      <CardContent className="py-12 px-6 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <IconBuildingStore className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Shopify store connected</h3>
        <p className="text-sm text-gray-500 mt-2">
          Connect a Shopify store to <span className="font-medium text-gray-700">{accountName}</span> so
          orders can be booked for pickup through GoGo Xpress. Once connected, sellers can request
          pickups for Shopify orders directly from the GGX plugin.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
          <ShopifyAppLink label="Install Shopify Plugin" />
          <ShopifyAppLink label="Connect Shopify Store" variant="outline" />
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Opens the GoGo Xpress listing on the Shopify App Store.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Connected Store: connected card ───────────────────────────────────────────

function field(label: string, value: ReactNode) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function ConnectedStoreCard({ store }: { store: ConnectedStore }) {
  const health = HEALTH_META[store.syncHealth];
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <IconBuildingStore className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">{store.storeName}</h3>
                <Badge variant="success">
                  <IconPlugConnected className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Badge variant={health.variant}>{health.label}</Badge>
              </div>
              <a
                href={`https://${store.storeDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                <IconWorld className="w-3.5 h-3.5" />
                {store.storeDomain}
                <IconExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>
          <a
            href={`https://${store.storeDomain}/admin`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-shrink-0')}
          >
            Manage Connection
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6 pt-6 border-t border-gray-100">
          {field('Connected Account', store.accountName)}
          {field('Connection Status', (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <IconCircleCheck className="w-4 h-4" /> Active
            </span>
          ))}
          {field('Last Sync', store.lastSyncAt)}
          {field('Connected By', (
            <span className="inline-flex items-center gap-1.5">
              <IconUser className="w-4 h-4 text-gray-400" /> {store.connectedBy}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Store connected since {store.connectedAt}.</p>
      </CardContent>
    </Card>
  );
}

// ─── Connected Store: Main Account coverage ────────────────────────────────────

function CoverageView({ rows }: { rows: StoreCoverageRow[] }) {
  const connected = rows.filter((r) => r.store).length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Store Coverage</CardTitle>
        <CardDescription>
          {connected} of {rows.length} subaccount{rows.length !== 1 ? 's' : ''} have a connected
          Shopify store. One Shopify store maps to one subaccount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subaccount</TableHead>
              <TableHead>Shopify Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.accountId}>
                <TableCell className="font-medium text-gray-900">{row.accountName}</TableCell>
                <TableCell>
                  {row.store ? (
                    <span className="inline-flex items-center gap-2">
                      <IconBuildingStore className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{row.store.storeDomain}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">No store connected</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.store ? (
                    <Badge variant={HEALTH_META[row.store.syncHealth].variant}>
                      {HEALTH_META[row.store.syncHealth].label}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-600">
                  {row.store ? row.store.lastSyncAt : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {row.store ? (
                    <a
                      href={`https://${row.store.storeDomain}/admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Manage <IconExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href={SHOPIFY_APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <IconPlus className="w-3.5 h-3.5" /> Connect
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Booking Guide ─────────────────────────────────────────────────────────────

const BOOKING_STEPS = [
  {
    n: 1,
    title: 'Request pickup',
    body: 'Click the Request Pickup icon for an individual order, or select multiple orders by ticking the checkboxes, then click the Request Pick-up button.',
  },
  {
    n: 2,
    title: 'Review details',
    body: 'Double-check the order details and delivery address, then select the appropriate packaging size. Different pouch sizes and box options are available with corresponding shipping fees. Take note of the packaging sizes and weight limits to avoid order cancellation.',
  },
  {
    n: 3,
    title: 'Confirm',
    body: 'Choose your preferred pick-up schedule and payment option, then click CONFIRM PICK-UP or REQUEST PICK-UP to proceed.',
  },
];

function BookingGuide() {
  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconBook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>How to request pickup</CardTitle>
              <CardDescription>
                A quick guide for booking Shopify orders for pickup through the GGX plugin.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {BOOKING_STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {step.n}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <IconInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Only one payment option can be used for all
              transactions in a bulk pick-up request.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <IconCircleCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">
              That's it. The order status updates to <span className="font-semibold">FOR PICK-UP</span>.
              Orders with this status before 12:00 midnight are picked up the next day.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sync Logs ─────────────────────────────────────────────────────────────────

function statusIcon(status: SyncStatus) {
  if (status === 'success') return <IconCircleCheck className="w-4 h-4 text-emerald-500" />;
  if (status === 'failed') return <IconAlertTriangle className="w-4 h-4 text-red-500" />;
  return <IconAlertTriangle className="w-4 h-4 text-amber-500" />;
}

function SyncLogsView({
  logs, showAccount, search, setSearch, statusFilter, setStatusFilter,
}: {
  logs: SyncLog[];
  showAccount: boolean;
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            placeholder="Search by store, message, or reference…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="w-full sm:w-[160px] flex-shrink-0">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className={logs.length === 0 ? '' : 'p-0'}>
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <IconRefresh className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">No sync activity yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Sync events between Shopify and GGX will appear here once a store is active.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Store</TableHead>
                  {showAccount && <TableHead>Subaccount</TableHead>}
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const ev = SYNC_EVENT_META[log.event];
                  const EvIcon = ev.icon;
                  const st = SYNC_STATUS_META[log.status];
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-500 whitespace-nowrap">{log.timestamp}</TableCell>
                      <TableCell className="text-gray-700">{log.storeName}</TableCell>
                      {showAccount && <TableCell className="text-gray-600">{log.accountName}</TableCell>}
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-gray-700">
                          <EvIcon className="w-4 h-4 text-gray-400" />
                          {ev.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          {statusIcon(log.status)}
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs">{log.message}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {log.referenceNumber ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Overview ──────────────────────────────────────────────────────────────────

function OverviewView({ stats, scoped }: { stats: ShopifyOverviewStats | null; scoped: boolean }) {
  return (
    <div className="space-y-6">
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <IconBuildingStore className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-1">Connect Shopify to GoGo Xpress</h3>
              <p className="text-sm text-emerald-800 mb-3 max-w-2xl">
                The Shopify integration lets your business connect a Shopify store to GGX Corporate.
                Sellers can request pickups for Shopify orders through the GGX plugin, and you can
                monitor {scoped ? 'this account’s' : 'each account and subaccount’s'} connection
                status and sync activity from here.
              </p>
              <ShopifyAppLink label="View on Shopify App Store" variant="outline" className="bg-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Connected Stores"
          value={stats?.connectedStores ?? '—'}
          sub={scoped ? 'For this account' : 'Across accounts'}
          icon={IconPlugConnected}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Orders Synced"
          value={stats?.ordersSynced ?? '—'}
          sub="Recent activity"
          icon={IconPackageImport}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Pickups Requested"
          value={stats?.pickupsRequested ?? '—'}
          sub="Sent to GGX"
          icon={IconTruck}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Sync Issues"
          value={stats?.syncIssues ?? '—'}
          sub="Warnings & failures"
          icon={IconAlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { icon: IconPlugConnected, title: 'Connect once', body: 'One Shopify store maps to one GGX account or subaccount. Install the plugin from the Shopify App Store and link it to this account.' },
          { icon: IconTruck, title: 'Book pickups', body: 'Sellers request pickups for Shopify orders straight from the plugin — single orders or in bulk. Orders flow into GGX for fulfillment.' },
          { icon: IconRefresh, title: 'Stay in sync', body: 'Tracking and delivery status are pushed back to Shopify automatically. Watch connection health and sync activity in Sync Logs.' },
        ].map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                <c.icon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{c.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function Shopify() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const { subAccountsEnabled, subAccounts, getCurrentAccountName } = useSubAccounts();
  const scopeId = useScopedAccountId();
  const mainView = subAccountsEnabled && scopeId === undefined; // consolidated admin view

  // The account id whose single store we resolve in scoped contexts.
  // Standard (non-subaccount) account → synthetic STANDARD_ACCOUNT_ID.
  const lookupId = !subAccountsEnabled ? STANDARD_ACCOUNT_ID : scopeId;

  const scopedAccountName = useMemo(() => {
    if (!subAccountsEnabled) return 'your account';
    return subAccounts.find((s) => s.id === scopeId)?.name ?? getCurrentAccountName();
  }, [subAccountsEnabled, subAccounts, scopeId, getCurrentAccountName]);

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<ShopifyOverviewStats | null>(null);
  const [store, setStore] = useState<ConnectedStore | null>(null);
  const [coverage, setCoverage] = useState<StoreCoverageRow[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logStatus, setLogStatus] = useState('all');

  // Overview stats
  useEffect(() => {
    getShopifyOverviewStats(mainView ? undefined : lookupId)
      .then(setStats).catch(() => {});
  }, [mainView, lookupId]);

  // Connected store / coverage
  useEffect(() => {
    let cancelled = false;
    if (mainView) {
      getStoreCoverage(subAccounts.map((s) => ({ id: s.id, name: s.name })))
        .then((rows) => { if (!cancelled) setCoverage(rows); })
        .catch(() => {});
    } else {
      getConnectedStore(lookupId)
        .then((s) => { if (!cancelled) setStore(s); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [mainView, lookupId, subAccounts]);

  // Sync logs (presentation filtering happens in the service for status/search)
  useEffect(() => {
    getSyncLogs({
      accountId: mainView ? undefined : lookupId,
      status: logStatus as SyncStatus | 'all',
      search: logSearch,
    }).then(setLogs).catch(() => {});
  }, [mainView, lookupId, logStatus, logSearch]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <IconBuildingStore className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopify</h1>
            <p className="text-gray-600 mt-0.5">
              Connect a Shopify store and book orders for pickup through GoGo Xpress.
            </p>
          </div>
        </div>
        <ShopifyAppLink label="Open Shopify App Listing" variant="outline" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="store">Connected Store</TabsTrigger>
          <TabsTrigger value="guide">Booking Guide</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewView stats={stats} scoped={!mainView} />
        </TabsContent>

        <TabsContent value="store" className="mt-6">
          {mainView ? (
            <CoverageView rows={coverage} />
          ) : store ? (
            <ConnectedStoreCard store={store} />
          ) : (
            <StoreEmptyState accountName={scopedAccountName} />
          )}
          {isManager && (
            <p className="text-xs text-gray-400 mt-3">
              Showing the Shopify connection for your assigned subaccount only.
            </p>
          )}
        </TabsContent>

        <TabsContent value="guide" className="mt-6">
          <BookingGuide />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <SyncLogsView
            logs={logs}
            showAccount={mainView}
            search={logSearch}
            setSearch={setLogSearch}
            statusFilter={logStatus}
            setStatusFilter={setLogStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
