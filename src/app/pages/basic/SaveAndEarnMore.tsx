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
  IconChevronRight,
  IconBrandShopee,
  IconGift,
  IconSparkles,
  IconChartBar,
} from '@tabler/icons-react';
import { cn } from '../../lib/utils';

interface FeatureRow {
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  href: string;
  tag?: string;
  tagColor?: string;
}

function FeatureRow({ item }: { item: FeatureRow }) {
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

function SectionCard({ title, iconBg, titleColor, items }: {
  title: string;
  iconBg?: string;
  titleColor?: string;
  items: FeatureRow[];
}) {
  return (
    <div className="bg-white mt-3">
      <div className="px-4 pt-4 pb-1">
        <p className={cn('text-xs font-bold uppercase tracking-widest', titleColor ?? 'text-gray-400')}>
          {title}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <FeatureRow key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

// ── GoPadala ─────────────────────────────────────────────────────────────────

const GOPADALA: FeatureRow[] = [
  {
    label: 'Same Day Delivery',
    sub: 'Book before 11AM for same-day delivery',
    icon: IconTruck,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    href: '/basic/same-day',
    tag: 'Eligibility required',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    label: 'Standard Delivery',
    sub: 'Nationwide, 1–5 business days',
    icon: IconPackage,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    href: '/basic/deliver?type=standard',
  },
  {
    label: 'Bulk Upload',
    sub: 'Upload many orders at once with a spreadsheet',
    icon: IconUpload,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    href: '/basic/bulk',
    tag: 'Free',
    tagColor: 'bg-violet-100 text-violet-700',
  },
];

// ── GoBenta ──────────────────────────────────────────────────────────────────

const GOBENTA: FeatureRow[] = [
  {
    label: 'Add Product',
    sub: 'List products to your storefront',
    icon: IconPlus,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    href: '/basic/inventory',
  },
  {
    label: 'Storefront',
    sub: 'Your online shop for buyers',
    icon: IconBuildingStore,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    href: '/basic/store',
  },
  {
    label: 'Create Promo',
    sub: 'Discount codes for your storefront buyers',
    icon: IconTag,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    href: '/basic/store',
  },
];

// ── Save and earn more ────────────────────────────────────────────────────────

const SAVE_EARN: FeatureRow[] = [
  {
    label: 'Sulit Bundles',
    sub: 'Prepaid delivery packs at a lower cost',
    icon: IconGift,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    href: '/basic/more',
    tag: 'New',
    tagColor: 'bg-rose-100 text-rose-700',
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
    label: 'Rewards',
    sub: 'Earn GGX points on every successful delivery',
    icon: IconStar,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    href: '#',
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

// ── Other features and tools ──────────────────────────────────────────────────

const OTHER_TOOLS: FeatureRow[] = [
  {
    label: 'Shopify',
    sub: 'Connect your Shopify store for auto-booking',
    icon: IconBrandShopee,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    href: '/basic/store',
  },
  {
    label: 'Analytics',
    sub: 'Shipment and revenue insights',
    icon: IconChartBar,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    href: '/basic/earnings',
  },
];

export function SaveAndEarnMore() {
  return (
    <div className="space-y-0 pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <IconSparkles className="w-4 h-4 text-blue-200" />
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">All Features</p>
        </div>
        <h2 className="text-lg font-bold text-white leading-tight">Everything in your account</h2>
        <p className="text-sm text-blue-100 mt-1 leading-snug">
          Ship, sell, and grow — all from one place.
        </p>
      </div>

      {/* GoPadala */}
      <SectionCard title="GoPadala — Shipping" titleColor="text-blue-600" items={GOPADALA} />

      {/* GoBenta */}
      <SectionCard title="GoBenta — Selling" titleColor="text-teal-600" items={GOBENTA} />

      {/* Save and earn more */}
      <SectionCard title="Save and Earn More" titleColor="text-rose-600" items={SAVE_EARN} />

      {/* Other features */}
      <SectionCard title="Other Features & Tools" titleColor="text-indigo-600" items={OTHER_TOOLS} />

      {/* Business upgrade CTA */}
      <div className="px-4 pt-3 pb-2">
        <Link to="/basic/qualify">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 active:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IconCurrencyDollar className="w-5 h-5 text-blue-600" />
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
