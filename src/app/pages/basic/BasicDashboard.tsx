import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  IconPackage,
  IconClock,
  IconCurrencyDollar,
  IconUpload,
  IconPlus,
  IconTruck,
  IconArrowRight,
  IconCircleCheckFilled,
  IconHourglass,
  IconBuildingStore,
  IconSparkles,
  IconChevronRight,
  IconTrendingUp,
} from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { GrowingNudgeCard } from '../../components/basic/GrowingNudgeCard';
import { useBasicSegment } from '../../contexts/BasicSegmentContext';

const MOCK_STATS = [
  { label: 'This Month',   value: '48',       sub: 'shipments',  icon: IconPackage,        bg: 'bg-blue-50',    color: 'text-blue-600' },
  { label: 'Active',       value: '7',        sub: 'in transit', icon: IconTruck,           bg: 'bg-orange-50',  color: 'text-orange-500' },
  { label: 'COD Pending',  value: '₱4,320',   sub: 'to collect', icon: IconCurrencyDollar,  bg: 'bg-emerald-50', color: 'text-emerald-600' },
];

const QUICK_ACTIONS = [
  { label: 'Same Day',     sub: 'Delivery',       icon: IconTruck,    bg: 'bg-orange-500', href: '/basic/deliver?type=sameday' },
  { label: 'Standard',     sub: 'Delivery',       icon: IconPackage,  bg: 'bg-blue-600',   href: '/basic/deliver?type=standard' },
  { label: 'Bulk Upload',  sub: 'CSV / Spreadsheet', icon: IconUpload,  bg: 'bg-violet-600', href: '/dashboard/bulk-uploader' },
  { label: 'Add Product',  sub: 'Inventory',      icon: IconPlus,     bg: 'bg-emerald-600', href: '/dashboard/inventory' },
];

const MOCK_ORDERS = [
  { id: 'GGX-240601-001', recipient: 'Maria Santos',    status: 'in-transit', amount: '₱320',  time: '2h ago' },
  { id: 'GGX-240531-009', recipient: 'Juan dela Cruz',  status: 'delivered',  amount: '₱150',  time: 'Yesterday' },
  { id: 'GGX-240531-007', recipient: 'Ana Reyes',       status: 'pending',    amount: '₱780',  time: 'Yesterday' },
  { id: 'GGX-240530-022', recipient: 'Carlo Bautista',  status: 'delivered',  amount: '₱460',  time: '2 days ago' },
];

const STATUS_CFG: Record<string, { label: string; variant: 'info' | 'success' | 'pending' }> = {
  'in-transit': { label: 'In Transit',  variant: 'info' },
  'delivered':  { label: 'Delivered',   variant: 'success' },
  'pending':    { label: 'Pending',     variant: 'pending' },
};

export function BasicDashboard() {
  const navigate = useNavigate();
  const { segment } = useBasicSegment();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });

  return (
    <div className="space-y-0">
      {/* Greeting header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500 leading-none">{greeting},</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5 leading-tight">Alex Mercado</h1>
        <p className="text-xs text-gray-400 mt-1">GGX Basic · Seller Account</p>
      </div>

      {/* Stats strip */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-1 px-1">
          {MOCK_STATS.map((s) => (
            <div
              key={s.label}
              className={cn('flex-shrink-0 flex items-center gap-3 rounded-xl px-3 py-2.5 min-w-[130px]', s.bg)}
            >
              <div className={cn('w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0')}>
                <s.icon className={cn('w-4 h-4', s.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-[11px] text-gray-500 leading-none mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growing nudge — shown when segment is growing */}
      {segment === 'growing' && (
        <div className="px-4 pt-4">
          <GrowingNudgeCard compact />
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.href)}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3.5 text-left active:scale-[0.98] transition-transform cursor-pointer hover:shadow-sm"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', a.bg)}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{a.label}</p>
                <p className="text-xs text-gray-400 leading-snug">{a.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent Orders</p>
          <Link to="/dashboard/transactions" className="text-xs font-medium text-blue-600 flex items-center gap-0.5">
            See all <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {MOCK_ORDERS.map((o) => {
                const sc = STATUS_CFG[o.status];
                return (
                  <button
                    key={o.id}
                    onClick={() => navigate(`/dashboard/transactions/${o.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {o.status === 'delivered'
                        ? <IconCircleCheckFilled className="w-4 h-4 text-emerald-500" />
                        : o.status === 'in-transit'
                        ? <IconTruck className="w-4 h-4 text-blue-500" />
                        : <IconHourglass className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{o.id}</p>
                      <p className="text-xs text-gray-500 leading-snug">{o.recipient}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant={sc.variant} className="text-[10px] px-1.5 py-0.5 leading-none">{sc.label}</Badge>
                      <span className="text-[11px] text-gray-400 leading-none tabular-nums">{o.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save & Earn promo */}
      <div className="px-4 pt-4 pb-4">
        <Link to="/basic/more">
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3 active:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <IconSparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">Save More. Earn More.</p>
              <p className="text-xs text-blue-100 leading-snug mt-0.5">Bundles, vouchers, rewards & more</p>
            </div>
            <IconChevronRight className="w-5 h-5 text-blue-200 flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Storefront promo */}
      <div className="px-4 pb-4">
        <Link to="/dashboard/storefront">
          <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3 active:bg-gray-50 transition-colors hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <IconBuildingStore className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">Your Storefront</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">Share your shop · Manage products</p>
            </div>
            <IconChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Not growing yet — show the nudge entry */}
      {segment === 'basic' && (
        <div className="px-4 pb-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconTrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900 leading-snug">Keep shipping to unlock more</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-snug">
                  Reach higher volume tiers for exclusive rates, priority support, and business benefits.
                </p>
                <Link to="/basic/qualify">
                  <Button size="sm" className="mt-3 h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3">
                    Learn about Business benefits
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
