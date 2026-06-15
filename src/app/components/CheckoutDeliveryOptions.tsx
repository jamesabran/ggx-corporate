/**
 * Buyer-facing delivery-option picker used on the public storefront / product
 * checkout. Rendered in its own card (heading matches "Payment options").
 *
 * On-Demand only appears here when the seller's scope has the On-Demand add-on
 * enabled (the caller decides which options to pass in). Same-day and On-demand
 * are additionally Metro-Manila-only: outside Metro Manila they are shown but
 * disabled with clear helper copy (the caller falls the selection back to
 * Standard). Buyers see timing/value labels, never the internal service keys.
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

/** Same-day / On-demand are Metro-Manila-only. */
const METRO_ONLY_OPTIONS: DeliveryServiceType[] = ['same_day', 'on_demand'];

export function CheckoutDeliveryOptions({
  options,
  value,
  onChange,
  region,
  metroOnly,
}: {
  options: DeliveryServiceType[];
  value: DeliveryServiceType;
  onChange: (v: DeliveryServiceType) => void;
  region: DeliveryRegion;
  /** Whether the delivery address is Metro Manila (gates Same-day / On-demand). */
  metroOnly: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Delivery option</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const meta = OPTION_META[opt];
          const Icon = meta.icon;
          const disabled = METRO_ONLY_OPTIONS.includes(opt) && !metroOnly;
          const selected = value === opt && !disabled;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => { if (!disabled) onChange(opt); }}
              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                disabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : selected
                    ? ACCENT_SELECTED[meta.accent]
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-tight">{meta.label}</span>
                <span className={`block text-xs ${disabled ? 'text-gray-400' : selected ? 'opacity-80' : 'text-gray-500'}`}>
                  {disabled ? 'Available for Metro Manila deliveries only.' : friendlyDeliveryLabel(opt, region)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
