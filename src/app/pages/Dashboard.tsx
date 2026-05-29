import { Link, useNavigate } from 'react-router';
import {
  IconPackage,
  IconClock,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconUpload,
  IconReceipt,
  IconKey,
  IconMessage,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
  IconCircleCheck,
  IconHourglass,
  IconCalendar,
  IconBuilding,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { deliveries, statusConfig } from '../data/transactions';

const stats = [
  { title: 'Active Deliveries', value: '2,847', change: '+12.5%', trend: 'up', icon: IconPackage, iconBg: 'bg-blue-600', cardBg: 'bg-blue-50', changeColor: 'text-blue-700' },
  { title: 'Pending Pickups', value: '184', change: '-8.2%', trend: 'down', icon: IconClock, iconBg: 'bg-orange-500', cardBg: 'bg-orange-50', changeColor: 'text-orange-700' },
  { title: 'Failed / Delayed', value: '23', change: '+3.1%', trend: 'up', icon: IconAlertTriangle, iconBg: 'bg-red-500', cardBg: 'bg-red-50', changeColor: 'text-red-700' },
  { title: 'Monthly Spend', value: '₱2,418,000', change: '+18.7%', trend: 'up', icon: IconCurrencyDollar, iconBg: 'bg-emerald-600', cardBg: 'bg-emerald-50', changeColor: 'text-emerald-700' },
];

const quickActions = [
  { title: 'Upload Bulk Bookings', description: 'Import CSV to create multiple shipments at once', icon: IconUpload, href: '/dashboard/bulk-uploader', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
  { title: 'View Billing Statement', description: 'Download invoices and billing reports', icon: IconReceipt, href: '/dashboard/billing', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { title: 'Generate API Key', description: 'Connect and integrate your own systems', icon: IconKey, href: '/dashboard/api-access', iconColor: 'text-violet-600', iconBg: 'bg-violet-50' },
  { title: 'Submit a Ticket', description: 'Report issues or follow up on tickets', icon: IconMessage, href: '/dashboard/support-tickets', iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
];

// Derived from the shared transaction dataset so every row links to a real
// record. `updated` is a Dashboard-only relative-time label.
const recentUpdatedLabels = ['2 hrs ago', '4 hrs ago', '6 hrs ago', '8 hrs ago', '12 hrs ago'];

const recentTransactions = deliveries.slice(0, 5).map((d, i) => ({
  tracking: d.tracking,
  recipient: d.recipient,
  destination: d.destination,
  status: d.status,
  updated: recentUpdatedLabels[i],
}));

const earningsRows = [
  { label: 'Earnings Disbursed', amount: '₱184,320', meta: 'Transferred to your account', icon: IconCircleCheck, iconColor: 'text-emerald-500' },
  { label: 'For Disbursal', amount: '₱56,940', meta: 'Next: Jun 1, 2024', metaIcon: IconCalendar, icon: IconCurrencyDollar, iconColor: 'text-blue-500' },
  { label: 'For Processing', amount: '₱23,100', meta: 'Pending clearance', icon: IconHourglass, iconColor: 'text-orange-400' },
];

const performanceRows = [
  { label: 'Delivered', value: 2674, dot: 'bg-emerald-500', pct: 69 },
  { label: 'In Transit', value: 849, dot: 'bg-blue-500', pct: 22 },
  { label: 'Failed / Returned', value: 164, dot: 'bg-red-400', pct: 4 },
  { label: 'Pending', value: 184, dot: 'bg-orange-400', pct: 5 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { subAccountsEnabled, currentAccount, getCurrentAccountName } = useSubAccounts();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back — here&apos;s your logistics overview.</p>
      </div>

      {subAccountsEnabled && currentAccount !== 'main' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <IconBuilding className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-900">Viewing: {getCurrentAccountName()}</span>
                </div>
                <p className="text-xs text-blue-700 mt-0.5">Showing data for this subaccount only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-0 shadow-none ${stat.cardBg}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-none">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-3 leading-none tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    {stat.trend === 'up'
                      ? <IconTrendingUp className={`w-4 h-4 flex-shrink-0 ${stat.changeColor}`} />
                      : <IconTrendingDown className={`w-4 h-4 flex-shrink-0 ${stat.changeColor}`} />}
                    <span className={`text-sm font-semibold ${stat.changeColor}`}>{stat.change}</span>
                    <span className="text-sm text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href} className="group">
              <Card className="h-full border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-150 cursor-pointer">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}>
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{action.title}</p>
                  <p className="text-sm text-gray-500 mt-1.5 leading-snug">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Recent Transactions</CardTitle>
              <Link to="/dashboard/transactions">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 -mr-1">
                  View all
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 flex-1">
            <div className="space-y-1">
              {recentTransactions.map((tx) => {
                const sc = statusConfig[tx.status as keyof typeof statusConfig];
                return (
                  <div
                    key={tx.tracking}
                    onClick={() => navigate(`/dashboard/transactions/${tx.tracking}`)}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate leading-snug">{tx.tracking}</p>
                      <p className="text-sm text-gray-500 truncate mt-0.5 leading-snug">{tx.recipient}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge variant={sc.variant} className="text-xs font-medium px-2 py-0.5 leading-none">{sc.label}</Badge>
                      <span className="text-xs text-gray-400 leading-none tabular-nums">{tx.updated}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Earnings Report</CardTitle>
              <Link to="/dashboard/earnings">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 -mr-1">
                  Full report
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-4 pb-5 flex-1 flex flex-col">
            <div className="flex-1 divide-y divide-gray-100">
              {earningsRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <row.icon className={`w-4 h-4 ${row.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{row.label}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {row.metaIcon && <row.metaIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                        <p className="text-sm text-gray-400 leading-snug">{row.meta}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-base font-bold text-gray-900 flex-shrink-0 ml-4 tabular-nums">{row.amount}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-400">Total COD collected</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">₱264,360</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Delivery Performance</CardTitle>
              <Link to="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 -mr-1">
                  Analytics
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-4 pb-5 flex-1 flex flex-col">
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Overall success rate</p>
                <p className="text-base font-bold text-gray-900">94.2%</p>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>
            <div className="flex-1 divide-y divide-gray-100">
              {performanceRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.dot}`} />
                  <p className="text-sm text-gray-700 flex-1 leading-none">{row.label}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                      <div className={`h-full rounded-full ${row.dot}`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 w-12 text-right tabular-nums">{row.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-400">Total shipments this period</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">3,871</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
