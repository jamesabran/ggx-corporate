import { useState } from 'react';
import { IconCash, IconWallet, IconCreditCard, IconBuildingBank, IconReceipt2 } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

type Tab = 'cash' | 'ewallet' | 'card' | 'banking';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', icon: <IconCash className="w-4 h-4" /> },
  { id: 'ewallet', label: 'E-wallets', icon: <IconWallet className="w-4 h-4" /> },
  { id: 'card', label: 'Credit or Debit card', icon: <IconCreditCard className="w-4 h-4" /> },
  { id: 'banking', label: 'Online banking', icon: <IconBuildingBank className="w-4 h-4" /> },
];

const BANKS = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'PNB', 'Security Bank'];

interface PaymentMethodTabsProps {
  // When true, "Pay via billing" is offered as the primary/default option
  // (account contract includes billing). The normal tabs appear as secondary.
  billingAvailable?: boolean;
}

/** Single bordered card with a tab row for the four normal payment methods. */
function NormalPaymentCard({ muted }: { muted?: boolean }) {
  const [active, setActive] = useState<Tab>('cash');
  const [cashOption, setCashOption] = useState<'pickup' | 'deduct'>('pickup');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  return (
    <div className={`rounded-lg border ${muted ? 'border-gray-200 opacity-95' : 'border-gray-200'} overflow-hidden`}>
      {/* Tab row */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                selected ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
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
          <div className="space-y-2">
            {([
              { id: 'pickup', title: 'Pay upon pick-up', help: 'Hand cash to the rider when your parcels are picked up.' },
              { id: 'deduct', title: 'Deduct from order total', help: 'Fees are deducted from your COD collections before payout.' },
            ] as const).map((opt) => {
              const selected = cashOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCashOption(opt.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input type="radio" name="ewallet" defaultChecked className="text-blue-600 focus:ring-blue-600" />
              <span className="text-sm font-medium text-gray-900">GCash</span>
              <Badge variant="success" className="ml-auto text-[10px]">Available</Badge>
            </label>
            {['Maya', 'GrabPay', 'coins.ph'].map((w) => (
              <div key={w} className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 opacity-60">
                <input type="radio" name="ewallet" disabled className="text-blue-600" />
                <span className="text-sm font-medium text-gray-500">{w}</span>
                <Badge variant="default" className="ml-auto text-[10px]">Coming soon</Badge>
              </div>
            ))}
          </div>
        )}

        {active === 'card' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-[10px]">Visa</Badge>
              <Badge variant="info" className="text-[10px]">Mastercard</Badge>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder name</label>
              <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
              <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expiration date</label>
                <Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                <Input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" />
              </div>
            </div>
          </div>
        )}

        {active === 'banking' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
            <Select value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Select preferred bank</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentMethodTabs({ billingAvailable = false }: PaymentMethodTabsProps) {
  const [payVia, setPayVia] = useState<'billing' | 'other'>(billingAvailable ? 'billing' : 'other');

  // Non-billing accounts: just the normal tabbed methods.
  if (!billingAvailable) {
    return <NormalPaymentCard />;
  }

  return (
    <div className="space-y-3">
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
        <span className="flex items-center gap-2 text-gray-500">
          <IconReceipt2 className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-sm font-medium text-gray-900">Pay via billing</span>
            <Badge variant="info" className="text-[10px]">Default</Badge>
          </span>
          <span className="block text-xs text-gray-500 mt-0.5">You&apos;ll receive an invoice after the service.</span>
        </span>
      </button>

      <div>
        <button
          type="button"
          onClick={() => setPayVia('other')}
          className={`text-sm font-medium ${payVia === 'other' ? 'text-gray-900' : 'text-blue-600 hover:text-blue-700'}`}
        >
          Other payment options
        </button>
        <div className={payVia === 'other' ? 'mt-2' : 'mt-2 opacity-60'}>
          <NormalPaymentCard muted={payVia !== 'other'} />
        </div>
      </div>
    </div>
  );
}
