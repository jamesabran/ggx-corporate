import { IconMapPin } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import type { Address } from './AddressBook';

const labelColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  office: 'info',
  home: 'success',
  warehouse: 'warning',
  custom: 'default',
};

function getDisplayLabel(addr: Address) {
  return addr.label === 'custom' ? addr.customLabel || 'Custom' : addr.label;
}

interface AddressDisplayCardProps {
  address: Address;
}

/**
 * Presentational address content shared between Address Book entries and the
 * Settings → Account Information card, so both render the same pattern.
 * Display-only — no actions. Wrap it in a `Card`/`CardContent` at the call site.
 */
export function AddressDisplayCard({ address }: AddressDisplayCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Badge variant={labelColors[address.label] || 'default'} className="text-xs px-2 py-0.5 mb-2 capitalize">
          {getDisplayLabel(address)}
        </Badge>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{address.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{address.mobileNumber}</p>
      </div>

      <div className="flex items-start gap-1.5 text-xs text-gray-600">
        <IconMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <span className="leading-snug">
          {[address.barangay, address.city, address.province].filter(Boolean).join(', ')}
          {address.postalCode && <span> {address.postalCode}</span>}
          {address.otherDetails && <span className="block text-gray-400">{address.otherDetails}</span>}
        </span>
      </div>
    </div>
  );
}

export { labelColors, getDisplayLabel };
