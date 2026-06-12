import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { IconArrowRight, IconChartHistogram } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useScopedAccountId } from '../hooks/useAccountScope';
import { getAccountNameById } from '../data/accounts';
import {
  getDashboardStats, getBasicAnalytics,
  type DashboardStats, type BasicAnalytics as BasicAnalyticsData,
} from '../services/transactionService';

const SERVICE_TYPE_BAR: Record<string, string> = {
  standard: 'bg-blue-500', same_day: 'bg-orange-500', on_demand: 'bg-violet-500',
};

/**
 * Basic Data Analytics — a lightweight, always-available analytics page (the
 * standalone counterpart to the Dashboard's Basic Analytics section). Distinct
 * from the gated Advanced Data Analytics workspace. Aggregates come from the
 * service layer (treated as backend-provided), scoped to the viewer.
 */
export function BasicAnalytics() {
  const scopeId = useScopedAccountId();
  const scopeName = scopeId ? getAccountNameById(scopeId) : null;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [basic, setBasic] = useState<BasicAnalyticsData | null>(null);

  useEffect(() => {
    let active = true;
    getDashboardStats(scopeId).then((s) => { if (active) setStats(s); }).catch(() => {});
    getBasicAnalytics(scopeId).then((b) => { if (active) setBasic(b); }).catch(() => {});
    return () => { active = false; };
  }, [scopeId]);

  const kpis = [
    { label: 'Total shipments', value: stats ? stats.total.toLocaleString() : '—' },
    { label: 'Delivered', value: stats ? stats.byStatus.delivered.toLocaleString() : '—' },
    { label: 'Success rate', value: stats ? `${stats.successRate}%` : '—' },
    { label: 'COD collected', value: stats ? `₱${stats.totalCod.toLocaleString()}` : '—' },
  ];
  const mix = basic?.serviceTypeMix ?? [];
  const total = basic?.periodTotal ?? 0;
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
                    {m.count}<span className="text-gray-400 font-normal ml-1">({total > 0 ? Math.round((m.count / total) * 100) : 0}%)</span>
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
