import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  IconPackage, IconCircleCheck, IconArrowBackUp, IconReceiptRefund,
  IconClockCheck, IconCash, IconTruckReturn, IconGauge, IconInfoCircle,
} from '@tabler/icons-react';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { getClaims, CLAIM_STATUS_META } from '../data/claims';
import { getSlaAlerts } from '../data/slaAlerts';

// ---------------------------------------------------------------------------
// Curated mock metrics modelled on the Business Review (Zenith PH) deck.
// Claims and SLA figures are derived from existing mock data modules; volume,
// efficiency and regional figures are curated mock aggregates.
// ---------------------------------------------------------------------------

const monthlyVolume = [
  { month: 'Jan', orders: 2501 },
  { month: 'Feb', orders: 2312 },
  { month: 'Mar', orders: 2678 },
  { month: 'Apr', orders: 2456 },
  { month: 'May', orders: 2847 },
];

const fulfillmentTrend = [
  { month: 'Jan', fulfilled: 95.0, rts: 3.4 },
  { month: 'Feb', fulfilled: 94.6, rts: 3.8 },
  { month: 'Mar', fulfilled: 95.4, rts: 3.0 },
  { month: 'Apr', fulfilled: 95.8, rts: 2.8 },
  { month: 'May', fulfilled: 95.2, rts: 3.1 },
];

const slaHitMiss = [
  { name: 'SLA Hit', value: 96.4, color: '#10b981' },
  { name: 'SLA Miss', value: 3.6, color: '#ef4444' },
];

const regionVolume = [
  { name: 'Metro Manila', value: 6120, color: '#3b82f6' },
  { name: 'Luzon (ex-NCR)', value: 3340, color: '#6366f1' },
  { name: 'Visayas', value: 2010, color: '#10b981' },
  { name: 'Mindanao', value: 1324, color: '#f59e0b' },
];

const avgDeliveryDays = [
  { area: 'Metro Manila', days: 1.4 },
  { area: 'Luzon (ex-NCR)', days: 2.1 },
  { area: 'Visayas', days: 3.0 },
  { area: 'Mindanao', days: 3.6 },
];

const returnsByReason = [
  { reason: 'Recipient unavailable', count: 168 },
  { reason: 'Incorrect address', count: 96 },
  { reason: 'Refused on delivery', count: 71 },
  { reason: 'Damaged in transit', count: 38 },
  { reason: 'Other', count: 24 },
];

export function DataAnalytics() {
  const { subAccountsEnabled, isMainAccountView, getCurrentAccountName } = useSubAccounts();
  const inSubaccountView = subAccountsEnabled && !isMainAccountView();

  // Derived figures from existing mock modules.
  const claims = getClaims();
  const claimsTotal = claims.length;
  const claimsOpen = claims.filter((c) => c.status === 'open' || c.status === 'in-review').length;
  const claimsSettledAmount = claims
    .filter((c) => c.status === 'settled' || c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const sla = getSlaAlerts();
  const activeSlaMisses = sla.filter((a) => a.type === 'breach' && a.status !== 'resolved').length;

  const totalReturns = returnsByReason.reduce((sum, r) => sum + r.count, 0);
  const maxReason = Math.max(...returnsByReason.map((r) => r.count));

  // Performance Overview KPIs.
  const primaryKpis = [
    { title: 'Total Orders',       value: '12,794',   sub: 'Across all accounts',   icon: IconPackage,     color: 'text-blue-600',   bg: 'bg-blue-100' },
    { title: 'Fulfilled Orders',   value: '12,180',   sub: '95.2% of total',        icon: IconCircleCheck, color: 'text-green-600',  bg: 'bg-green-100' },
    { title: 'Delivery Efficiency', value: '95.2%',   sub: '+0.4% vs last period',  icon: IconGauge,       color: 'text-violet-600', bg: 'bg-violet-100' },
    { title: 'RTS Rate',           value: '3.1%',     sub: 'Return-to-sender',      icon: IconArrowBackUp, color: 'text-amber-600',  bg: 'bg-amber-100' },
  ];

  const secondaryKpis = [
    { title: 'SLA Hit / Miss',     value: '96.4% / 3.6%', sub: `${activeSlaMisses} active SLA breach${activeSlaMisses === 1 ? '' : 'es'}`, icon: IconClockCheck,    color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Returned / For Return', value: `${totalReturns}`, sub: 'This period',          icon: IconTruckReturn,   color: 'text-orange-600',  bg: 'bg-orange-100' },
    { title: 'Claims',             value: `${claimsTotal}`, sub: `${claimsOpen} open / in review`, icon: IconReceiptRefund, color: 'text-red-600',     bg: 'bg-red-100' },
    { title: 'Amount Settled',     value: `₱${(2418000 + claimsSettledAmount).toLocaleString()}`, sub: 'Payouts + approved claims', icon: IconCash, color: 'text-green-700', bg: 'bg-green-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Analytics</h1>
          <p className="text-gray-600 mt-1">Performance overview across orders, fulfillment, SLA, returns, and claims</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="30">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All Regions</option>
            <option value="ncr">Metro Manila</option>
            <option value="luzon">Luzon (ex-NCR)</option>
            <option value="visayas">Visayas</option>
            <option value="mindanao">Mindanao</option>
          </Select>
        </div>
      </div>

      {/* Subaccount context banner */}
      {inSubaccountView && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
          <IconInfoCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Showing analytics for <span className="font-semibold">{getCurrentAccountName()}</span>.
            Switch to Main Account to see consolidated data across all subaccounts.
          </p>
        </div>
      )}

      {/* Performance Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryKpis.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{s.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-2">{s.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryKpis.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{s.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{s.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Volume + Fulfillment trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Order Volume</CardTitle>
            <CardDescription>Total orders per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment vs RTS Trend</CardTitle>
            <CardDescription>Fulfilled rate and return-to-sender rate by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fulfillmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="fulfilled" stroke="#10b981" strokeWidth={2} name="Fulfilled %" />
                <Line type="monotone" dataKey="rts" stroke="#f59e0b" strokeWidth={2} name="RTS %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA + Region share */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Hit / Miss</CardTitle>
            <CardDescription>On-SLA vs breached deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={slaHitMiss} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                  {slaHitMiss.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Sharing by Region</CardTitle>
            <CardDescription>Order distribution across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={regionVolume} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {regionVolume.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delivery days + Returns + Claims summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Avg. Delivery Days by Area</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {avgDeliveryDays.map((d) => (
                <div key={d.area} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{d.area}</span>
                  <span className="text-sm font-medium text-gray-900">{d.days.toFixed(1)} days</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Returns by Reason</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returnsByReason.map((r) => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{r.reason}</span>
                    <span className="text-sm font-medium text-gray-900">{r.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(r.count / maxReason) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Claims Summary</CardTitle></CardHeader>
          <CardContent>
            {claimsTotal === 0 ? (
              <p className="text-sm text-gray-500">No claims filed.</p>
            ) : (
              <div className="space-y-3">
                {(['open', 'in-review', 'approved', 'denied', 'settled'] as const).map((st) => {
                  const count = claims.filter((c) => c.status === st).length;
                  if (count === 0) return null;
                  const meta = CLAIM_STATUS_META[st];
                  return (
                    <div key={st} className="flex items-center justify-between">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Total claims</span>
                  <span className="text-sm font-semibold text-gray-900">{claimsTotal}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
