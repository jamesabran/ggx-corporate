import { Link } from 'react-router';
import {
  IconBuildingStore,
  IconExternalLink,
  IconBox,
  IconTag,
  IconBrandShopee,
  IconChevronRight,
  IconEye,
  IconShare,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface ToolRow {
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  to: string;
  badge?: string;
}

const TOOLS: ToolRow[] = [
  { label: 'Inventory',    sub: 'Add and manage your products',          icon: IconBox,         iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', to: '/basic/inventory' },
  { label: 'Promo Codes',  sub: 'Create discount codes for buyers',      icon: IconTag,         iconBg: 'bg-pink-100',    iconColor: 'text-pink-600',    to: '/basic/store' },
  { label: 'Connect Shopify', sub: 'Sync your Shopify store — free',      icon: IconBrandShopee, iconBg: 'bg-green-100',   iconColor: 'text-green-600',   to: '/basic/store', badge: 'Free' },
];

export function BasicStore() {
  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Storefront card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 px-4 pt-4 pb-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <IconBuildingStore className="w-4 h-4 text-teal-100" />
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-widest">Your Storefront</span>
            <Badge variant="success" className="text-[10px] px-1.5 py-0.5 leading-none ml-auto">Live</Badge>
          </div>
          <h2 className="text-lg font-bold leading-tight">Alex’s Shop</h2>
          <p className="text-sm text-teal-50 mt-0.5">gogoxpress.shop/alex-shop</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <Link to="/shop/alex-shop" className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50">
            <IconEye className="w-4 h-4" /> Preview
          </Link>
          <button className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50 cursor-pointer">
            <IconShare className="w-4 h-4" /> Share link
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-3 gap-1">
        {[
          { value: '24',  label: 'Products' },
          { value: '156', label: 'Visits (7d)' },
          { value: '12',  label: 'Orders (7d)' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <p className="text-xl font-extrabold text-gray-900 leading-none tabular-nums">{s.value}</p>
            <p className="text-[11px] text-gray-400 font-medium text-center leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commerce tools */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-900">Commerce tools</p>
        <div className="divide-y divide-gray-50">
          {TOOLS.map((t) => (
            <Link key={t.label} to={t.to} className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', t.iconBg)}>
                <t.icon className={cn('w-5 h-5', t.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{t.label}</p>
                  {t.badge && <Badge variant="success" className="text-[10px] px-1.5 py-0.5 leading-none">{t.badge}</Badge>}
                </div>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{t.sub}</p>
              </div>
              <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <Link to="/basic/inventory">
        <Button className="w-full h-12 text-base">
          <IconExternalLink className="w-4 h-4" /> Add a product
        </Button>
      </Link>
    </div>
  );
}
