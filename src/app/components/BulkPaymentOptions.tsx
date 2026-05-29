import { useState } from 'react';
import { IconReceipt2, IconCash, IconWallet, IconCreditCard, IconBuildingBank, IconChevronDown } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

type Method = 'billing' | 'cash' | 'ewallet' | 'card' | 'banking';

interface BulkPaymentOptionsProps {
  // Mock: corporate accounts are typically invoiced ("via billing").
  billingAccount?: boolean;
}

const BANKS = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Landbank', 'PNB', 'Security Bank'];

function RadioRow({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  disabled,
  trailing,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border transition-colors ${selected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200'} ${disabled ? 'opacity-60' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-blue-600' : 'border-gray-300'}`}>
          {selected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
        </span>
        <span className="text-gray-500 flex-shrink-0">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-gray-900">{title}</span>
          {subtitle && <span className="block text-xs text-gray-500">{subtitle}</span>}
        </span>
        {trailing}
      </button>
      {selected && children && <div className="px-4 pb-4 pt-1 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export function BulkPaymentOptions({ billingAccount = true }: BulkPaymentOptionsProps) {
  const [method, setMethod] = useState<Method>(billingAccount ? 'billing' : 'cash');
  const [showOthers, setShowOthers] = useState(!billingAccount);
  const [cashOption, setCashOption] = useState<'pickup' | 'deduct'>('pickup');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const standardMethods = (
    <div className="space-y-2">
      <RadioRow
        selected={method === 'cash'}
        onSelect={() => setMethod('cash')}
        icon={<IconCash className="w-4 h-4" />}
        title="Cash"
        subtitle="Pay with cash"
      >
        <div className="space-y-2 mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="cashOption" checked={cashOption === 'pickup'} onChange={() => setCashOption('pickup')} className="text-blue-600 focus:ring-blue-600" />
            Pay upon pick-up
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="cashOption" checked={cashOption === 'deduct'} onChange={() => setCashOption('deduct')} className="text-blue-600 focus:ring-blue-600" />
            Deduct from order total
          </label>
        </div>
      </RadioRow>

      <RadioRow
        selected={method === 'ewallet'}
        onSelect={() => setMethod('ewallet')}
        icon={<IconWallet className="w-4 h-4" />}
        title="E-wallets"
        subtitle="GCash and more"
      >
        <div className="space-y-2 mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="ewallet" defaultChecked className="text-blue-600 focus:ring-blue-600" />
            GCash
          </label>
          {['Maya', 'GrabPay', 'coins.ph'].map((w) => (
            <div key={w} className="flex items-center gap-2 text-sm text-gray-400">
              <input type="radio" disabled className="text-blue-600" />
              {w}
              <Badge variant="default" className="text-[10px]">Coming soon</Badge>
            </div>
          ))}
        </div>
      </RadioRow>

      <RadioRow
        selected={method === 'card'}
        onSelect={() => setMethod('card')}
        icon={<IconCreditCard className="w-4 h-4" />}
        title="Credit or Debit card"
        subtitle="Visa, Mastercard"
      >
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
            <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
            <Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CVC</label>
            <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name on card</label>
            <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Full name" />
          </div>
        </div>
      </RadioRow>

      <RadioRow
        selected={method === 'banking'}
        onSelect={() => setMethod('banking')}
        icon={<IconBuildingBank className="w-4 h-4" />}
        title="Online banking"
        subtitle="Pay via your bank"
      >
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select bank</label>
          <Select value={bank} onChange={(e) => setBank(e.target.value)}>
            <option value="">Choose a bank</option>
            {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </div>
      </RadioRow>
    </div>
  );

  if (!billingAccount) {
    return standardMethods;
  }

  return (
    <div className="space-y-3">
      <RadioRow
        selected={method === 'billing'}
        onSelect={() => setMethod('billing')}
        icon={<IconReceipt2 className="w-4 h-4" />}
        title="Pay via billing"
        subtitle="Billed to your corporate account"
        trailing={<Badge variant="info">Default</Badge>}
      >
        <p className="text-sm text-gray-600 mt-2">
          You&apos;ll receive an invoice for these shipments after the service. No upfront payment is required.
        </p>
      </RadioRow>

      <button
        type="button"
        onClick={() => setShowOthers(!showOthers)}
        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Pay with another method instead
        <IconChevronDown className={`w-4 h-4 transition-transform ${showOthers ? 'rotate-180' : ''}`} />
      </button>

      {showOthers && standardMethods}
    </div>
  );
}
