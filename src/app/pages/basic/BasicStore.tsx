import { useState } from 'react';
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
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { cn } from '../../lib/utils';

interface ToolRow {
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  /** Real navigation target. Omitted for demo stubs. */
  to?: string;
  /** Demo stub: a badge + a small interest/coming-soon dialog instead of routing. */
  stub?: 'soon' | 'interest';
}

const TOOLS: ToolRow[] = [
  { label: 'Inventory',       sub: 'Add and manage your products',     icon: IconBox,         iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', to: '/basic/inventory' },
  { label: 'Promo Codes',     sub: 'Create discount codes for buyers', icon: IconTag,         iconBg: 'bg-pink-100',    iconColor: 'text-pink-600',    stub: 'soon' },
  { label: 'Connect Shopify', sub: 'Sync products from your Shopify store', icon: IconBrandShopee, iconBg: 'bg-green-100', iconColor: 'text-green-600', stub: 'interest' },
];

const STUB_COPY: Record<'soon' | 'interest', { badge: string; title: string; body: string; cta: string }> = {
  soon: {
    badge: 'Coming soon',
    title: 'Promo Codes are coming soon',
    body: 'Soon you’ll be able to create discount codes for your storefront buyers. We’ll let you know the moment it’s ready.',
    cta: 'Notify me',
  },
  interest: {
    badge: 'Express interest',
    title: 'Connect your Shopify store',
    body: 'Shopify sync for Basic sellers is on the way and free to use. Let us know you’re interested and we’ll reach out with setup steps.',
    cta: 'Express interest',
  },
};

export function BasicStore() {
  const [stub, setStub] = useState<null | 'soon' | 'interest'>(null);
  const [done, setDone] = useState(false);

  const openStub = (kind: 'soon' | 'interest') => { setDone(false); setStub(kind); };
  const closeStub = () => setStub(null);

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
          {TOOLS.map((t) => {
            const inner = (
              <>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', t.iconBg)}>
                  <t.icon className={cn('w-5 h-5', t.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{t.label}</p>
                    {t.stub && (
                      <Badge variant={t.stub === 'soon' ? 'default' : 'info'} className="text-[10px] px-1.5 py-0.5 leading-none">
                        {STUB_COPY[t.stub].badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug mt-0.5">{t.sub}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </>
            );
            return t.stub ? (
              <button
                key={t.label}
                onClick={() => openStub(t.stub!)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer"
              >
                {inner}
              </button>
            ) : (
              <Link key={t.label} to={t.to!} className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

      <Link to="/basic/inventory">
        <Button className="w-full h-12 text-base">
          <IconExternalLink className="w-4 h-4" /> Add a product
        </Button>
      </Link>

      {/* Intentional demo stub dialog (Promo Codes / Connect Shopify) */}
      <Dialog open={stub !== null} onClose={closeStub} title={stub ? STUB_COPY[stub].title : undefined}>
        {stub && !done && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">{STUB_COPY[stub].body}</p>
            <Button className="w-full h-11" onClick={() => setDone(true)}>{STUB_COPY[stub].cta}</Button>
          </div>
        )}
        {stub && done && (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
              <IconCircleCheckFilled className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900">You’re on the list</p>
            <p className="text-xs text-gray-500 mt-1 mb-4 max-w-xs leading-snug">
              Thanks! We’ll reach out as soon as this is ready for your account.
            </p>
            <Button variant="outline" className="h-11 px-6" onClick={closeStub}>Done</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
