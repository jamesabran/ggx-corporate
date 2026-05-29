import { useState } from 'react';
import { IconCash, IconWallet, IconCreditCard, IconBuildingBank, IconReceipt2 } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

type Tab = 'cash' | 'ewallet' | 'card' | 'banking';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', icon: <IconCash className="w-4 h-4" /> },
  { id: 'ewallet', label: 'E-wallets', icon: <IconWallet className="w-4 h-4" /> },
  { id: 'card', label: 'Card', icon: <IconCreditCard className="w-4 h-4" /> },
  { id: 'banking', label: 'Online banking', icon: <IconBuildingBank className="w-4 h-4" /> },
];

const BANKS = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'PNB', 'Security Bank'];

// Brand logo slots. Drop a real asset path into `src` to swap the fallback for
// an image later — no other change needed. Fallback is a colored initial box.
const BRAND_LOGOS: Record<string, { src?: string; bg: string; short: string }> = {
  GCash: { bg: 'bg-blue-600', short: 'G' },
  Maya: { bg: 'bg-green-600', short: 'M' },
  GrabPay: { bg: 'bg-emerald-600', short: 'Gp' },
  'coins.ph': { bg: 'bg-yellow-500', short: 'c' },
  Visa: { bg: 'bg-blue-700', short: 'V' },
  Mastercard: { bg: 'bg-orange-500', short: 'MC' },
};

function BrandLogo({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const logo = BRAND_LOGOS[name];
  if (logo?.src) {
    return <img src={logo.src} alt={name} className={`${className} rounded object-contain`} />;
  }
  return (
    <span className={`${className} ${logo?.bg ?? 'bg-gray-400'} rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
      {logo?.short ?? name.charAt(0)}
    </span>
  );
}

const WALLETS = [
  { name: 'GCash', available: true },
  { name: 'Maya', available: false },
  { name: 'GrabPay', available: false },
  { name: 'coins.ph', available: false },
];

/** Single bordered card with a tab row for the four normal payment methods. */
function NormalPaymentCard({ disabled = false }: { disabled?: boolean }) {
  const [active, setActive] = useState<Tab>('cash');
  const [cashOption, setCashOption] = useState<'pickup' | 'deduct'>('pickup');
  const [wallet, setWallet] = useState('GCash');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  return (
    <div
      aria-disabled={disabled}
      className={`rounded-lg border border-gray-200 ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}`}
    >
      {/* Tab row — rounded-t + overflow-hidden so active styling never overflows the corners */}
      <div className="flex bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => { if (!disabled) setActive(t.id); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selected ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {active === 'cash' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              { id: 'pickup', title: 'Pay upon pick-up', help: 'Hand cash to the rider at pick-up.' },
              { id: 'deduct', title: 'Deduct from order total', help: 'Fees deducted from your COD collections.' },
            ] as const).map((opt) => {
              const selected = cashOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => { if (!disabled) setCashOption(opt.id); }}
                  className={`h-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    selected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${selected ? 'border-blue-600' : 'border-gray-300'}`}>
                    {selected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{opt.title}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{opt.help}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {active === 'ewallet' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WALLETS.map((w) => {
              const selected = w.available && wallet === w.name;
              return (
                <button
                  key={w.name}
                  type="button"
                  disabled={disabled || !w.available}
                  onClick={() => { if (!disabled && w.available) setWallet(w.name); }}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-center transition-colors ${
                    selected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200'
                  } ${w.available ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <BrandLogo name={w.name} className="w-7 h-7" />
                  <span className="text-xs font-medium text-gray-900">{w.name}</span>
                  {w.available ? (
                    <Badge variant="success" className="text-[9px]">Available</Badge>
                  ) : (
                    <Badge variant="default" className="text-[9px]">Coming soon</Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {active === 'card' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BrandLogo name="Visa" className="w-8 h-5" />
              <BrandLogo name="Mastercard" className="w-8 h-5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder name</label>
              <Input disabled={disabled} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
              <Input disabled={disabled} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expiration date</label>
                <Input disabled={disabled} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                <Input disabled={disabled} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" />
              </div>
            </div>
          </div>
        )}

        {active === 'banking' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
            <Select disabled={disabled} value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Select preferred bank</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

interface PaymentMethodTabsProps {
  // Driven by the selected account/subaccount contract. When true, "Pay via
  // billing" is the primary/default option; the normal tabs are secondary and
  // only become usable after the user explicitly selects "Other payment options".
  billingAvailable?: boolean;
}

export function PaymentMethodTabs({ billingAvailable = false }: PaymentMethodTabsProps) {
  const [payVia, setPayVia] = useState<'billing' | 'other'>(billingAvailable ? 'billing' : 'other');

  // Non-billing accounts: just the normal tabbed methods, fully enabled.
  if (!billingAvailable) {
    return <NormalPaymentCard />;
  }

  const otherSelected = payVia === 'other';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setPayVia('billing')}
        className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
          payVia === 'billing' ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${payVia === 'billing' ? 'border-blue-600' : 'border-gray-300'}`}>
          {payVia === 'billing' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
        </span>
        <IconReceipt2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Pay via billing</span>
            <Badge variant="info" className="text-[10px]">Default</Badge>
          </span>
          <span className="block text-xs text-gray-500 mt-0.5">You&apos;ll receive an invoice after the service.</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setPayVia('other')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
          otherSelected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${otherSelected ? 'border-blue-600' : 'border-gray-300'}`}>
          {otherSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
        </span>
        <span className="flex-1">
          <span className="text-sm font-medium text-gray-900">Other payment options</span>
          <span className="block text-xs text-gray-500 mt-0.5">Cash, e-wallets, card, or online banking.</span>
        </span>
      </button>

      {/* Tabs are disabled (visually + functionally) until "Other payment options" is selected. */}
      <NormalPaymentCard disabled={!otherSelected} />
    </div>
  );
}
