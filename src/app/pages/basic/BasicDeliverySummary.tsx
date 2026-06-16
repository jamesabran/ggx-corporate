import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconTruckDelivery,
  IconBuildingStore,
  IconChevronRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { BookingDraft, FirstMile } from '../../lib/basicBookingTypes';

function AddressLine({ label, name, address }: { label: 'Sender' | 'Receiver'; name: string; address: string }) {
  const isSender = label === 'Sender';
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1 flex-shrink-0">
        <div
          className={cn(
            'w-3 h-3 rounded-full border-2',
            isSender ? 'border-blue-500 bg-blue-100' : 'border-red-500 bg-red-100',
          )}
        />
        {isSender && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{name}</p>
        <p className="text-xs text-gray-500 leading-snug truncate">{address}</p>
      </div>
    </div>
  );
}

const FIRST_MILE_OPTIONS: {
  key: FirstMile;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'pickup',
    label: 'Rider Pick-up',
    sub: 'Our rider collects from your address',
    icon: IconTruckDelivery,
  },
  {
    key: 'dropoff',
    label: 'Drop-off',
    sub: 'Drop your parcel at the nearest hub',
    icon: IconBuildingStore,
  },
];

function formatAddress(addr: BookingDraft['sender'] | BookingDraft['receiver']): string {
  if (!addr) return '—';
  return [addr.street, addr.unit, addr.barangay, addr.city, addr.province]
    .filter(Boolean)
    .join(', ');
}

export function BasicDeliverySummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevDraft = (location.state as { draft?: BookingDraft } | null)?.draft;

  const [firstMile, setFirstMile] = useState<FirstMile>(prevDraft?.firstMile ?? 'pickup');

  if (!prevDraft?.sender || !prevDraft?.receiver) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  const { sender, receiver } = prevDraft;

  const handleNext = () => {
    const draft: BookingDraft = { ...prevDraft, firstMile };
    navigate('/basic/deliver/items', { state: { draft } });
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Step header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Step 3 of 6
        </p>
        <p className="text-[13px] text-gray-500 leading-snug">
          Confirm your delivery route and pick-up method.
        </p>
      </div>

      {/* Sender → Receiver summary */}
      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <AddressLine
          label="Sender"
          name={`${sender.name} | ${sender.mobile}`}
          address={formatAddress(sender)}
        />
        <AddressLine
          label="Receiver"
          name={`${receiver.name} | ${receiver.mobile}`}
          address={formatAddress(receiver)}
        />
      </div>

      {/* First mile selector */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            How we collect
          </p>
          <IconInfoCircle className="w-3.5 h-3.5 text-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {FIRST_MILE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = firstMile === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setFirstMile(opt.key)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all cursor-pointer',
                  selected
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <Icon className={cn('w-5 h-5', selected ? 'text-blue-600' : 'text-gray-400')} />
                <p className={cn('text-sm font-semibold leading-snug', selected ? 'text-blue-900' : 'text-gray-900')}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estimated schedule info */}
      <div className="mx-4 mt-3 bg-blue-50 rounded-2xl border border-blue-100 p-3 flex items-start gap-2">
        <IconInfoCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-snug">
          Book before <strong>2:00 PM</strong> for same-business-day pick-up.
          Standard delivery: <strong>1–5 business days</strong> nationwide.
        </p>
      </div>

      {/* CTA */}
      <div className="px-4 pt-4">
        <Button className="w-full h-12 text-base" onClick={handleNext}>
          Next — Item Details
          <IconChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
