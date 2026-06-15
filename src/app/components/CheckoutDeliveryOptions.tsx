/**
 * Buyer-facing delivery-option picker used on the public storefront / product
 * checkout. On-Demand only appears here when the seller's scope has the
 * On-Demand add-on enabled (the caller decides which options to pass in).
 *
 * Buyers see timing/value labels (e.g. "Within 40 minutes"), never the internal
 * service keys. Timing copy is region-aware for Standard (see checkoutEstimates).
 */
import { IconTruck, IconClock, IconBolt } from '@tabler/icons-react';
import type { DeliveryServiceType } from '../services/transactionService';
import { friendlyDeliveryLabel, type DeliveryRegion } from '../lib/checkoutEstimates';

const OPTION_META: Record<DeliveryServiceType, { label: string; icon: typeof IconTruck; accent: string }> = {
  standard: { label: 'Standard delivery', icon: IconTruck, accent: 'blue' },
  same_day: { label: 'Same-day delivery', icon: IconClock, accent: 'orange' },
  on_demand: { label: 'On-demand delivery', icon: IconBolt, accent: 'violet' },
};

const ACCENT_SELECTED: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-50 text-blue-700',
  orange: 'border-orange-500 bg-orange-50 text-orange-700',
  violet: 'border-violet-500 bg-violet-50 text-violet-700',
};

export function CheckoutDeliveryOptions({
  options,
  value,
  onChange,
  region,
}: {
  options: DeliveryServiceType[];
  value: DeliveryServiceType;
  onChange: (v: DeliveryServiceType) => void;
  region: DeliveryRegion;
}) {
  if (options.length <= 1) return null;
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery option</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const meta = OPTION_META[opt];
          const Icon = meta.icon;
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                selected ? ACCENT_SELECTED[meta.accent] : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-tight">{meta.label}</span>
                <span className={`block text-xs ${selected ? 'opacity-80' : 'text-gray-500'}`}>
                  {friendlyDeliveryLabel(opt, region)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
