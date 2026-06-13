import { Link } from 'react-router';
import {
  IconTruck,
  IconPackage,
  IconUpload,
  IconPlus,
  IconBuildingStore,
  IconTag,
  IconTicket,
  IconCurrencyDollar,
  IconStar,
  IconUsers,
  IconShoppingCart,
  IconChartBar,
  IconChevronRight,
  IconBrandShopee,
  IconGift,
  IconSparkles,
} from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

interface FeatureTile {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  color: string;
  href: string;
  badge?: string;
}

const ALL_FEATURES: FeatureTile[] = [
  { label: 'Same Day Delivery',  icon: IconTruck,          bg: 'bg-orange-50', color: 'text-orange-500', href: '/basic/deliver?type=sameday' },
  { label: 'Standard Delivery',  icon: IconPackage,        bg: 'bg-blue-50',   color: 'text-blue-600',   href: '/basic/deliver?type=standard' },
  { label: 'Bulk Upload',        icon: IconUpload,         bg: 'bg-violet-50', color: 'text-violet-600', href: '/dashboard/bulk-uploader' },
  { label: 'Add Product',        icon: IconPlus,           bg: 'bg-emerald-50',color: 'text-emerald-600',href: '/dashboard/inventory' },
  { label: 'Storefront',         icon: IconBuildingStore,  bg: 'bg-teal-50',   color: 'text-teal-600',   href: '/dashboard/storefront' },
  { label: 'Create Promo',       icon: IconTag,            bg: 'bg-pink-50',   color: 'text-pink-600',   href: '/dashboard/storefront' },
  { label: 'Shopify',            icon: IconBrandShopee,    bg: 'bg-green-50',  color: 'text-green-600',  href: '/dashboard/shopify' },
  { label: 'Analytics',          icon: IconChartBar,       bg: 'bg-indigo-50', color: 'text-indigo-600', href: '/dashboard/analytics/basic' },
];

interface SaveEarnItem {
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  href: string;
  tag?: string;
  tagColor?: string;
}

const SAVE_ITEMS: SaveEarnItem[] = [
  {
    label: 'Sulit Bundles',
    sub: 'Pre-paid delivery packs at discounted rates',
    icon: IconShoppingCart,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    href: '#',
    tag: 'Popular',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    label: 'Vouchers',
    sub: 'Apply voucher codes for delivery discounts',
    icon: IconTicket,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    href: '#',
  },
  {
    label: 'Discounted Rates',
    sub: 'Volume-based pricing for frequent shippers',
    icon: IconCurrencyDollar,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    href: '/basic/qualify',
    tag: 'Unlock more',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
];

const EARN_ITEMS: SaveEarnItem[] = [
  {
    label: 'Rewards',
    sub: 'Earn GGX points on every successful delivery',
    icon: IconGift,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    href: '#',
    tag: 'New',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Exclusive Tier',
    sub: 'Reach higher tiers for premium perks',
    icon: IconStar,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    href: '/basic/qualify',
    tag: 'HVM benefit',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    label: 'Referrals',
    sub: 'Invite sellers and earn credits per signup',
    icon: IconUsers,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    href: '#',
  },
];

function FeatureTileItem({ tile }: { tile: FeatureTile }) {
  return (
    <Link to={tile.href} className="group">
      <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 active:bg-gray-50 transition-colors hover:shadow-sm">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', tile.bg)}>
          <tile.icon className={cn('w-6 h-6', tile.color)} />
        </div>
        <span className="text-xs font-medium text-gray-700 text-center leading-snug">{tile.label}</span>
        {tile.badge && (
          <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 leading-none">
            {tile.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function SaveEarnRow({ item }: { item: SaveEarnItem }) {
  return (
    <Link to={item.href}>
      <div className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors cursor-pointer">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', item.iconBg)}>
          <item.icon className={cn('w-5 h-5', item.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{item.label}</p>
            {item.tag && (
              <span className={cn('text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none', item.tagColor)}>
                {item.tag}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.sub}</p>
        </div>
        <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
      </div>
    </Link>
  );
}

export function SaveAndEarnMore() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <IconSparkles className="w-4 h-4 text-blue-200" />
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">All Features</p>
        </div>
        <h2 className="text-lg font-bold text-white leading-tight">Save More. Earn More.</h2>
        <p className="text-sm text-blue-100 mt-1 leading-snug">
          Everything in your Basic account — ship smarter and grow your business.
        </p>
      </div>

      {/* Feature tiles */}
      <div className="bg-gray-50 px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Shipping & Commerce</p>
        <div className="grid grid-cols-4 gap-2">
          {ALL_FEATURES.map((t) => (
            <FeatureTileItem key={t.label} tile={t} />
          ))}
        </div>
      </div>

      {/* Save section */}
      <div className="mt-4 bg-white">
        <div className="px-4 pt-4 pb-1 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
            <IconCurrencyDollar className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Save</p>
          <p className="text-xs text-gray-400">Reduce your shipping costs</p>
        </div>
        <Card className="mx-4 mb-2 border-gray-100 shadow-none rounded-xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-50">
            {SAVE_ITEMS.map((item) => (
              <SaveEarnRow key={item.label} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Earn section */}
      <div className="mt-2 bg-white pb-4">
        <div className="px-4 pt-4 pb-1 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
            <IconStar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Earn</p>
          <p className="text-xs text-gray-400">Rewards for your loyalty</p>
        </div>
        <Card className="mx-4 border-gray-100 shadow-none rounded-xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-50">
            {EARN_ITEMS.map((item) => (
              <SaveEarnRow key={item.label} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Business upgrade CTA */}
      <div className="px-4 pt-2 pb-4">
        <Link to="/basic/qualify">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 active:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IconStar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 leading-snug">Unlock Business Pricing</p>
              <p className="text-xs text-blue-700 leading-snug mt-0.5">
                Volume shippers may qualify for contracted rates and HVM benefits.
              </p>
            </div>
            <IconChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  );
}
