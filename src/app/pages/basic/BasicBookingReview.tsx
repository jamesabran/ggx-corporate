import { useLocation, useNavigate } from 'react-router';
import {
  IconPackage,
  IconMapPin,
  IconUser,
  IconPhone,
  IconCurrencyDollar,
  IconArrowRight,
  IconTruckDelivery,
  IconHome,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface BookingDraft {
  type: 'standard';
  recipient: string;
  contact: string;
  address: string;
  cod: string;
  handoff: 'pickup' | 'dropoff';
}

const DEFAULT_DRAFT: BookingDraft = {
  type: 'standard',
  recipient: 'Maria Santos',
  contact: '+63 917 555 0142',
  address: 'Quezon City, Metro Manila',
  cod: '1250',
  handoff: 'pickup',
};

// Estimated, frontend-only preview. Authoritative fees are service/backend-owned.
const SHIPPING_FEE = 59;

export function BasicBookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = { ...DEFAULT_DRAFT, ...(location.state as Partial<BookingDraft> | null) };

  const cod = Number(draft.cod) || 0;

  const summaryRows = [
    { icon: IconUser,           label: 'Recipient',        value: draft.recipient },
    { icon: IconPhone,          label: 'Contact',          value: draft.contact },
    { icon: IconMapPin,         label: 'Delivery address', value: draft.address },
    {
      icon: draft.handoff === 'dropoff' ? IconHome : IconTruckDelivery,
      label: 'Handoff',
      value: draft.handoff === 'dropoff' ? 'Drop-off at nearest hub' : 'Rider pickup',
    },
  ];

  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Service type */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <IconPackage className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">Standard Delivery</p>
          <p className="text-xs text-gray-500 leading-snug">Nationwide · 1–5 business days</p>
        </div>
      </div>

      {/* Delivery summary */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Delivery details</p>
        <div className="divide-y divide-gray-50">
          {summaryRows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3.5">
              <r.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">{r.label}</p>
                <p className="text-sm text-gray-800 leading-snug">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & fees */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Payment & fees</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Shipping fee (est.)</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">₱{SHIPPING_FEE.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Item protection</span>
            <span className="text-sm text-gray-400">Not added</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <IconCurrencyDollar className="w-4 h-4 text-gray-400" /> COD to collect
            </span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">₱{cod.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Estimated charge</span>
            <span className="text-lg font-extrabold text-blue-600 tabular-nums">₱{SHIPPING_FEE.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 leading-snug mt-3">
          Estimated only — final shipping fees and surcharges are confirmed by GoGo Xpress at booking.
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5">
        <Button
          className="w-full h-12 text-base"
          onClick={() => navigate('/basic/orders/GGX-240601-001')}
        >
          Confirm booking <IconArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          className={cn('w-full h-12 text-base text-gray-600')}
          onClick={() => navigate('/basic/deliver?type=standard')}
        >
          Edit details
        </Button>
      </div>
    </div>
  );
}
