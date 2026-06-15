import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  IconTruck,
  IconPackage,
  IconArrowRight,
  IconMapPin,
  IconUser,
  IconPhone,
  IconCurrencyDollar,
  IconTruckDelivery,
  IconHome,
} from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

type FieldKey = 'recipient' | 'contact' | 'address' | 'cod';

const SERVICE_TYPES = [
  {
    key: 'standard',
    label: 'Standard Delivery',
    sub: 'Nationwide, 1–5 business days',
    icon: IconPackage,
    bg: 'bg-blue-600',
    locked: false,
    eta: '1–5 business days',
    rate: 'Starting at ₱59',
  },
  {
    // Same-Day is an enabled-only capability — not a default Basic service.
    // Tapping it routes to the Business Benefits (Growing) nudge instead of booking.
    key: 'sameday',
    label: 'Same Day Delivery',
    sub: 'Available to qualified accounts',
    icon: IconTruck,
    bg: 'bg-orange-500',
    locked: true,
    eta: 'Eligibility required',
    rate: 'Talk to us',
  },
];

const FORM_FIELDS: { key: FieldKey; icon: typeof IconUser; label: string; placeholder: string; inputMode?: 'tel' | 'numeric' }[] = [
  { key: 'recipient', icon: IconUser,           label: 'Recipient Name',    placeholder: 'Full name' },
  { key: 'contact',   icon: IconPhone,          label: 'Contact Number',    placeholder: '+63 9XX XXX XXXX', inputMode: 'tel' },
  { key: 'address',   icon: IconMapPin,         label: 'Delivery Address',  placeholder: 'Street, City, Province' },
  { key: 'cod',       icon: IconCurrencyDollar, label: 'COD Amount (opt.)', placeholder: '0.00', inputMode: 'numeric' },
];

export function BasicDeliver() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = params.get('type') ?? 'standard';
  // Same-Day is eligibility-gated, so it can never be the selected (bookable) type.
  const preselected = requested === 'sameday' ? 'standard' : requested;

  const [handoff, setHandoff] = useState<'pickup' | 'dropoff'>('pickup');
  const [form, setForm] = useState<Record<FieldKey, string>>({
    recipient: '', contact: '', address: '', cod: '',
  });

  const goToReview = () =>
    navigate('/basic/deliver/review', {
      state: { type: 'standard', handoff, ...form },
    });

  return (
    <div className="space-y-0">
      {/* Service type selector */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Service Type</p>
        <div className="space-y-2.5">
          {SERVICE_TYPES.map((s) => (
            <button
              key={s.key}
              onClick={() =>
                s.locked
                  ? navigate('/basic/same-day')
                  : navigate(`/basic/deliver?type=${s.key}`, { replace: true })
              }
              className={cn(
                'w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                s.locked
                  ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  : preselected === s.key
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{s.label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{s.sub}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={cn('text-xs font-semibold', s.locked ? 'text-blue-600' : 'text-gray-700')}>{s.rate}</p>
                <p className="text-[11px] text-gray-400">{s.eta}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Handoff: rider pickup vs drop-off */}
      <div className="bg-white px-4 pt-4 pb-3 mt-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">How we collect</p>
        <div className="grid grid-cols-2 gap-2.5">
          {([
            { key: 'pickup',  label: 'Rider pickup',  sub: 'We collect from you', icon: IconTruckDelivery },
            { key: 'dropoff', label: 'Drop-off',      sub: 'At the nearest hub',  icon: IconHome },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setHandoff(opt.key)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer',
                handoff === opt.key ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <opt.icon className={cn('w-5 h-5', handoff === opt.key ? 'text-blue-600' : 'text-gray-400')} />
              <p className="text-sm font-semibold text-gray-900 leading-snug">{opt.label}</p>
              <p className="text-[11px] text-gray-500 leading-snug">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick-form */}
      <div className="bg-white px-4 pt-4 pb-4 mt-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Delivery Details</p>
        <Card className="border-gray-100 shadow-none">
          <CardContent className="p-0 divide-y divide-gray-50">
            {FORM_FIELDS.map((f) => (
              <div key={f.label} className="flex items-center gap-3 px-4 py-3.5">
                <f.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">{f.label}</p>
                  <input
                    type="text"
                    inputMode={f.inputMode}
                    value={form[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-sm text-gray-700 placeholder-gray-300 bg-transparent border-none outline-none leading-snug"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="px-4 pt-2 pb-4 space-y-3">
        <Button
          className="w-full h-12 text-base"
          onClick={goToReview}
        >
          Review booking
          <IconArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-center text-gray-400">
          For bulk bookings,{' '}
          <button
            onClick={() => navigate('/basic/bulk')}
            className="text-blue-600 underline underline-offset-2 cursor-pointer"
          >
            use Bulk Upload
          </button>
          {' '}instead.
        </p>
      </div>
    </div>
  );
}
