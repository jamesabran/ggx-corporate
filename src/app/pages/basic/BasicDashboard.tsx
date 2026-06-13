import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  IconPackage,
  IconUpload,
  IconBuildingStore,
  IconArrowRight,
  IconCircleCheckFilled,
  IconHourglass,
  IconTruck,
  IconTicket,
  IconGift,
  IconUsers,
  IconChartBar,
  IconBrandShopee,
  IconClock,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui/Badge';
import { GrowingNudgeCard } from '../../components/basic/GrowingNudgeCard';
import { useBasicSegment } from '../../contexts/BasicSegmentContext';
import { cn } from '../../lib/utils';

// ── Service tiles ────────────────────────────────────────────────────────────

interface ServiceTile {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  tileBg: string;
  href: string;
  badge?: string;
}

const SERVICE_TILES: ServiceTile[] = [
  {
    label: 'Same Day\nDelivery',
    icon: IconClock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    tileBg: 'bg-white',
    href: '/basic/deliver?type=sameday',
  },
  {
    label: 'Standard\nDelivery',
    icon: IconPackage,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tileBg: 'bg-white',
    href: '/basic/deliver?type=standard',
  },
  {
    label: 'Bulk\nUpload',
    icon: IconUpload,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    tileBg: 'bg-white',
    href: '/dashboard/bulk-uploader',
  },
  {
    label: 'Prepaid\nPacks',
    icon: IconGift,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    tileBg: 'bg-white',
    href: '/basic/more',
    badge: 'Save',
  },
];

// ── Explore more tiles ────────────────────────────────────────────────────────

interface ExploreTile {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  href: string;
}

const EXPLORE_TILES: ExploreTile[] = [
  { label: 'Shopify',    icon: IconBrandShopee,   iconBg: 'bg-green-100',  iconColor: 'text-green-600',  href: '/dashboard/shopify' },
  { label: 'Storefront', icon: IconBuildingStore,  iconBg: 'bg-teal-100',   iconColor: 'text-teal-600',   href: '/dashboard/storefront' },
  { label: 'Rewards',    icon: IconGift,           iconBg: 'bg-pink-100',   iconColor: 'text-pink-600',   href: '/basic/more' },
  { label: 'Referrals',  icon: IconUsers,          iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  href: '/basic/more' },
  { label: 'Analytics',  icon: IconChartBar,       iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', href: '/dashboard/analytics/basic' },
  { label: 'Vouchers',   icon: IconTicket,         iconBg: 'bg-red-100',    iconColor: 'text-red-500',    href: '/basic/more' },
];

// ── Activity stats ────────────────────────────────────────────────────────────

const ACTIVITY_STATS = [
  { value: '48',  label: 'New Orders' },
  { value: '38',  label: 'Deliveries' },
  { value: '93%', label: 'On-Time' },
  { value: '3',   label: 'Returns' },
];

// ── Recent orders ─────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'GGX-240601-001', recipient: 'Maria Santos',   status: 'in-transit', time: '2h ago' },
  { id: 'GGX-240531-009', recipient: 'Juan dela Cruz', status: 'delivered',  time: 'Yesterday' },
  { id: 'GGX-240531-007', recipient: 'Ana Reyes',      status: 'pending',    time: 'Yesterday' },
  { id: 'GGX-240530-022', recipient: 'Carlo Bautista', status: 'delivered',  time: '2 days ago' },
];

const STATUS_CFG: Record<string, { label: string; variant: 'info' | 'success' | 'pending'; icon: React.ComponentType<{ className?: string }> }> = {
  'in-transit': { label: 'In Transit', variant: 'info',    icon: IconTruck },
  'delivered':  { label: 'Delivered',  variant: 'success', icon: IconCircleCheckFilled },
  'pending':    { label: 'Pending',    variant: 'pending', icon: IconHourglass },
};

// ─────────────────────────────────────────────────────────────────────────────

export function BasicDashboard() {
  const navigate = useNavigate();
  const { segment } = useBasicSegment();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  });

  return (
    // Extra top padding so content doesn't crowd the sticky header
    <div className="px-4 pt-2 pb-2 space-y-5">

      {/* ── Welcome ── */}
      <div className="pt-1">
        <p className="text-sm text-gray-500 leading-snug">{greeting}</p>
        <h1 className="text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight">
          Alex!
        </h1>
      </div>

      {/* ── HVM nudge (Growing state) ── */}
      {segment === 'growing' && <GrowingNudgeCard />}

      {/* ── Service tiles (2 × 2) ── */}
      <div>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_TILES.map((tile) => (
            <button
              key={tile.label}
              onClick={() => navigate(tile.href)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-3 rounded-2xl shadow-sm cursor-pointer',
                'active:scale-[0.97] transition-transform',
                tile.tileBg,
                'py-6 px-3'
              )}
            >
              {/* Badge */}
              {tile.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-green-500 text-white rounded-full px-2 py-0.5 leading-none">
                  {tile.badge}
                </span>
              )}

              {/* Icon container */}
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', tile.iconBg)}>
                <tile.icon className={cn('w-8 h-8', tile.iconColor)} />
              </div>

              {/* Label */}
              <p className="text-sm font-bold text-gray-800 text-center leading-snug whitespace-pre-line">
                {tile.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Explore more ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-sm font-bold text-gray-900">Explore more</p>
          <Link to="/basic/more" className="flex items-center gap-0.5 text-sm font-semibold text-blue-600">
            View all <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none px-3 pb-4">
          {EXPLORE_TILES.map((tile) => (
            <Link
              key={tile.label}
              to={tile.href}
              className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px] active:opacity-70 transition-opacity"
            >
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', tile.iconBg)}>
                <tile.icon className={cn('w-7 h-7', tile.iconColor)} />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-snug">{tile.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Activity ── */}
      <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Activity for Last 7 Days</p>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
            View <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* COD summary strip */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider leading-none mb-1">Deposited</p>
            <p className="text-2xl font-extrabold text-blue-600 leading-none tabular-nums">₱18,450</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider leading-none mb-1">For Processing</p>
            <p className="text-xl font-bold text-gray-700 leading-none tabular-nums">₱4,320</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1">
          {ACTIVITY_STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <p className="text-xl font-extrabold text-gray-900 leading-none tabular-nums">{s.value}</p>
              <p className="text-[11px] text-gray-400 font-medium text-center leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-gray-900">Recent Orders</p>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
            See all <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {MOCK_ORDERS.map((o) => {
            const sc = STATUS_CFG[o.status];
            const StatusIcon = sc.icon;
            return (
              <button
                key={o.id}
                onClick={() => navigate(`/dashboard/transactions/${o.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Status icon container */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  o.status === 'delivered'  ? 'bg-emerald-50' :
                  o.status === 'in-transit' ? 'bg-blue-50' : 'bg-orange-50'
                )}>
                  <StatusIcon className={cn(
                    'w-5 h-5',
                    o.status === 'delivered'  ? 'text-emerald-500' :
                    o.status === 'in-transit' ? 'text-blue-500' : 'text-orange-400'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{o.id}</p>
                  <p className="text-xs text-gray-500 leading-snug">{o.recipient}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Badge variant={sc.variant} className="text-[10px] px-2 py-0.5 leading-none">{sc.label}</Badge>
                  <span className="text-[11px] text-gray-400 leading-none">{o.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Basic state: soft upgrade nudge at bottom ── */}
      {segment === 'basic' && (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <IconGift className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">Ship more to unlock benefits</p>
            <Link to="/basic/qualify" className="text-xs font-semibold text-blue-600 leading-snug">
              Learn about Business pricing →
            </Link>
          </div>
        </div>
      )}

      {/* Bottom spacer so last card isn't flush with the nav */}
      <div className="h-1" />
    </div>
  );
}
