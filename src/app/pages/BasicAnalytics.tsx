import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { IconArrowRight, IconChartHistogram } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useScopedAccountId } from '../hooks/useAccountScope';
import { getAccountNameById } from '../data/accounts';
import {
  getBasicAnalytics,
  type BasicAnalytics as BasicAnalyticsData,
  type DeliveryServiceType,
} from '../services/transactionService';

const SERVICE_TYPE_BAR: Record<string, string> = {
  standard: 'bg-blue-500', same_day: 'bg-orange-500', on_demand: 'bg-violet-500',
};

type DatePreset = 'last7' | 'last30' | 'this_month';

const DATE_PRESETS: { value: DatePreset; label: string; days: number }[] = [
  { value: 'last7',      label: '7 days',     days: 7 },
  { value: 'last30',     label: '30 days',    days: 30 },
  { value: 'this_month', label: 'This month', days: new Date().getDate() },
];

const SERVICE_TYPE_OPTIONS: { value: DeliveryServiceType | 'all'; label: string }[] = [
  { value: 'all',       label: 'All service types' },
  { value: 'standard',  label: 'Standard' },
  { value: 'same_day',  label: 'Same-Day' },
  { value: 'on_demand', label: 'On-Demand' },
];

/**
 * Basic Data Analytics — lightweight, always-available analytics page. Distinct
 * from the gated Advanced Data Analytics workspace. Date preset tabs and service
 * type filter both wire through to the service layer so data actually changes.
 */
export function BasicAnalytics() {
  const scopeId = useScopedAccountId();
  const scopeName = scopeId ? getAccountNameById(scopeId) : null;
  const [preset, setPreset] = useState<DatePreset>('last7');
  const [serviceType, setServiceType] = useState<DeliveryServiceType | 'all'>('all');
  const [basic, setBasic] = useState<BasicAnalyticsData | null>(null);

  useEffect(() => {
    let active = true;
    const days = DATE_PRESETS.find((p) => p.value === preset)?.days ?? 7;
    getBasicAnalytics(scopeId, { days, serviceType: serviceType === 'all' ? undefined : serviceType })
      .then((b) => { if (active) setBasic(b); })
      .catch(() => {});
    return () => { active = false; };
  }, [scopeId, preset, serviceType]);

  const periodTotal = basic?.periodTotal ?? 0;
  const kpis = [
    { label: 'Total shipments', value: basic ? periodTotal.toLocaleString() : '—' },
    { label: 'Delivered', value: basic ? (basic.byStatus.delivered ?? 0).toLocaleString() : '—' },
    { label: 'Success rate', value: basic ? `${basic.successRate}%` : '—' },
    { label: 'COD collected', value: basic ? `₱${basic.totalCod.toLocaleString()}` : '—' },
  ];
  const mix = basic?.serviceTypeMix ?? [];
  const maxMix = Math.max(1, ...mix.map((m) => m.count));
  const days = basic?.dailyVolume ?? [];
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Basic Data Analytics</h1>
          <p className="text-gray-600 mt-1">
            A quick read on delivery volume and outcomes{scopeName ? ` for ${scopeName}` : ''}.
          </p>
        </div>
        <Link to="/dashboard/analytics">
          <Button variant="outline" size="sm">
            <IconChartHistogram className="w-4 h-4" /> Open Advanced Analytics
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                preset === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="w-48">
          <Select value={serviceType} onChange={(e) => setServiceType(e.target.value as DeliveryServiceType | 'all')}>
            {SERVICE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Bookings by Service Type</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mix.map((m) => (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{m.label}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {m.count}<span className="text-gray-400 font-normal ml-1">({periodTotal > 0 ? Math.round((m.count / periodTotal) * 100) : 0}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${SERVICE_TYPE_BAR[m.key] ?? 'bg-gray-400'}`} style={{ width: `${(m.count / maxMix) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily Booking Volume</CardTitle></CardHeader>
          <CardContent>
            {days.length === 0 ? (
              <p className="text-sm text-gray-400">No booking activity in this period.</p>
            ) : (
              <div className="flex items-end justify-between gap-2">
                {days.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 tabular-nums">{d.count}</span>
                    <div className="w-full bg-blue-50 rounded-md flex items-end" style={{ height: 96 }}>
                      <div className="w-full bg-blue-500 rounded-md" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 tabular-nums">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900">Need deeper analysis?</p>
            <p className="text-sm text-gray-500 mt-0.5">Advanced Data Analytics adds filters, trends, SLA/exception analysis, and exports.</p>
          </div>
          <Link to="/dashboard/analytics">
            <Button size="sm">Open Advanced Analytics <IconArrowRight className="w-4 h-4" /></Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
