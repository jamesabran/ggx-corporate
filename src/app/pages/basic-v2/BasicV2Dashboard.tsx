import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconHourglass,
  IconTruck,
  IconGift,
  IconChevronRight,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui/Badge';
import { useBasicSegment } from '../../contexts/BasicSegmentContext';

import iconSdd        from '@/assets/basic/icon-sdd.png';
import iconStandard   from '@/assets/basic/icon-standard.png';
import iconBulk       from '@/assets/basic/icon-bulk.png';
import iconPacks      from '@/assets/basic/icon-packs.png';
import iconPacksBanner from '@/assets/basic/icon-packs-banner.png';
import iconShopify    from '@/assets/basic/icon-shopify.png';
import iconStorefront from '@/assets/basic/icon-storefront.png';
import iconRewards    from '@/assets/basic/icon-rewards.png';
import iconReferrals  from '@/assets/basic/icon-referrals.png';
import iconAnalytics  from '@/assets/basic/icon-analytics.png';
import iconSddBanner  from '@/assets/basic/icon-sdd.png';

// ── Promo banner carousel ─────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'packs',
    icon: iconPacksBanner,
    accentBg: 'bg-pink-50',
    accentBorder: 'border-pink-100',
    headline: <><strong>Sulit Bundles</strong> — Save more per delivery</>,
    sub: 'Prepaid deliveries at a lower rate.',
    cta: 'View Sulit Bundles',
    href: '/basic/more',
  },
  {
    id: 'sdd',
    icon: iconSddBanner,
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-100',
    headline: <>Same-Day Delivery now available</>,
    sub: 'Book before 11AM · door by 6PM.',
    cta: 'Learn more',
    href: '/basic/same-day',
  },
  {
    id: 'rewards',
    icon: iconRewards,
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-100',
    headline: <>Earn rewards every shipment</>,
    sub: 'Points for every delivery you book.',
    cta: 'View Rewards',
    href: '/basic/more',
  },
];

function PromoCarousel() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(Math.max(idx, 0), SLIDES.length - 1));
  }, []);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-none"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="flex w-full flex-shrink-0 items-center gap-3 bg-white border border-gray-200 rounded-2xl p-4"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border ${slide.accentBg} ${slide.accentBorder}`}>
              <img src={slide.icon} alt="" className="h-10 w-10 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{slide.headline}</p>
              <p className="text-xs text-gray-500 mt-0.5">{slide.sub}</p>
              <button
                onClick={() => navigate(slide.href)}
                className="mt-1 text-xs font-semibold text-blue-600 cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {slide.cta} →
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.id}
            style={{
              display: 'block',
              width: i === active ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === active ? '#1e8fd6' : '#d1dfe8',
              transition: 'width 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Service tiles ─────────────────────────────────────────────────────────────

interface PrimaryTile {
  label: string;
  img: string;
  href: string;
  badge?: string;
  highlight?: boolean;
}

const PRIMARY_TILES: PrimaryTile[] = [
  {
    label: 'Same Day\nDelivery',
    img: iconSdd,
    href: '/basic/same-day',
  },
  {
    label: 'Standard\nDelivery',
    img: iconStandard,
    href: '/basic-v2/delivery',
    highlight: true,
  },
  {
    label: 'Bulk\nUpload',
    img: iconBulk,
    href: '/basic/bulk',
    badge: 'Free',
  },
  {
    label: 'Sulit\nBundles',
    img: iconPacks,
    href: '/basic/more',
    badge: 'New',
  },
];

const SECONDARY_TILES = [
  { label: 'Shopify',     img: iconShopify,    href: '/basic/store' },
  { label: 'Storefront',  img: iconStorefront, href: '/basic/store' },
  { label: 'Rewards',     img: iconRewards,    href: '/basic/more' },
  { label: 'Referrals',   img: iconReferrals,  href: '/basic/more' },
  { label: 'Analytics',   img: iconAnalytics,  href: '/basic/earnings' },
];

// ── Recent orders ─────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'GGX-240601-001', recipient: 'Maria Santos',   status: 'in-transit', time: '2h ago' },
  { id: 'GGX-240531-009', recipient: 'Juan dela Cruz', status: 'delivered',  time: 'Yesterday' },
  { id: 'GGX-240531-007', recipient: 'Ana Reyes',      status: 'pending',    time: 'Yesterday' },
  { id: 'GGX-240530-022', recipient: 'Carlo Bautista', status: 'delivered',  time: '2 days ago' },
];

const STATUS_CFG: Record<string, {
  label: string;
  variant: 'info' | 'success' | 'pending';
  icon: React.ComponentType<{ className?: string }>;
}> = {
  'in-transit': { label: 'In Transit', variant: 'info',    icon: IconTruck },
  'delivered':  { label: 'Delivered',  variant: 'success', icon: IconCircleCheckFilled },
  'pending':    { label: 'Pending',    variant: 'pending', icon: IconHourglass },
};

// ── Activity stats ────────────────────────────────────────────────────────────

const MOCK_STATS = { earnings: '₱135.8K', deliveries: '4.2K', forPickup: '18' };

// ─────────────────────────────────────────────────────────────────────────────

export function BasicV2Dashboard() {
  const navigate = useNavigate();
  const { segment } = useBasicSegment();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  });

  return (
    <div className="space-y-4 px-4 pt-4 pb-4">

      {/* ── Promo carousel ── */}
      <PromoCarousel />

      {/* ── Greeting ── */}
      <div>
        <p className="text-sm font-medium text-gray-500">{greeting}</p>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
          Welcome, <span className="text-blue-600">Max!</span>
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">What do you want to send today?</p>
      </div>

      {/* ── Services card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Services</p>

        {/* Primary 4-up grid */}
        <div className="flex gap-2">
          {PRIMARY_TILES.map((tile) => (
            <button
              key={tile.label}
              onClick={() => navigate(tile.href)}
              className="relative flex flex-1 flex-col items-center cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              {tile.badge && (
                <span
                  className="absolute -right-1 -top-2 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold text-white"
                  style={{ background: '#22c55e' }}
                >
                  {tile.badge}
                </span>
              )}
              <div
                className={`flex h-[76px] w-full items-center justify-center rounded-xl border ${
                  tile.highlight
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <img src={tile.img} alt={tile.label.replace('\n', ' ')} className="h-14 w-14 object-contain" />
              </div>
              <p className="mt-1.5 whitespace-pre-line text-center text-[11px] font-bold leading-snug text-gray-700">
                {tile.label}
              </p>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-gray-100" />

        {/* Secondary 5-up row */}
        <div className="flex justify-between">
          {SECONDARY_TILES.map((tile) => (
            <Link
              key={tile.label}
              to={tile.href}
              className="flex flex-1 flex-col items-center gap-1 active:opacity-70 transition-opacity"
            >
              <div className="flex h-12 w-12 items-center justify-center">
                <img src={tile.img} alt={tile.label} className="h-10 w-10 object-contain" />
              </div>
              <span className="text-center text-[10px] font-semibold text-gray-600">{tile.label}</span>
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="mt-3 flex items-center justify-center">
          <Link to="/basic/more" className="flex items-center gap-1 text-xs font-semibold text-blue-600">
            View all features <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Activity summary ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">Activity</p>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Last 7 days</span>
          </div>
          <Link to="/basic/earnings" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
            Analytics <IconArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Earnings',    value: MOCK_STATS.earnings,   color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
            { label: 'Deliveries',  value: MOCK_STATS.deliveries, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
            { label: 'For Pickup',  value: MOCK_STATS.forPickup,  color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-xl border p-3 ${bg} ${border}`}>
              <p className={`text-lg font-extrabold leading-none tabular-nums ${color}`}>{value}</p>
              <p className="mt-1 text-[10px] font-semibold text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Recent Orders</p>
          <Link to="/basic/orders" className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
            See all <IconChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_ORDERS.map((o) => {
            const sc = STATUS_CFG[o.status];
            const StatusIcon = sc.icon;
            return (
              <button
                key={o.id}
                onClick={() => navigate(`/basic/orders/${o.id}`)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    o.status === 'delivered'  ? 'bg-emerald-50' :
                    o.status === 'in-transit' ? 'bg-blue-50'    : 'bg-orange-50'
                  }`}
                >
                  <StatusIcon className={`h-4 w-4 ${
                    o.status === 'delivered'  ? 'text-emerald-500' :
                    o.status === 'in-transit' ? 'text-blue-500'    : 'text-orange-400'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{o.id}</p>
                  <p className="text-xs text-gray-500">{o.recipient}</p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <Badge variant={sc.variant} className="text-[10px] px-1.5 py-0.5 leading-none">{sc.label}</Badge>
                  <span className="text-[10px] text-gray-400">{o.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Upgrade nudge ── */}
      {segment === 'basic' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <IconGift className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Ship more to unlock benefits</p>
            <Link to="/basic/qualify" className="text-xs font-semibold text-blue-600">
              Learn about Business pricing →
            </Link>
          </div>
        </div>
      )}

      <div className="h-1" />
    </div>
  );
}
