import { IconMapPin } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { labelColors, getDisplayLabel } from './AddressDisplayCard';
import type { Address } from './AddressBook';

interface CompactAddressCardProps {
  address: Address;
  onChangeClick: () => void;
}

/**
 * Compact inline address display for form contexts (e.g. Operations Requests modal).
 * Shows label badge, recipient name, contact, and formatted address line.
 * Includes a "Change" action that opens the Address Book picker at the call site.
 *
 * For the full display-only variant see AddressDisplayCard.
 * Figma: GGX-SHADCN → Address Display Card page (compact variant).
 */
export function CompactAddressCard({ address, onChangeClick }: CompactAddressCardProps) {
  const addrParts = [address.barangay, address.city, address.province].filter(Boolean).join(', ');
  const addrLine  = [addrParts, address.otherDetails].filter(Boolean).join(' — ');

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={labelColors[address.label] || 'default'}
            className="text-xs px-2 py-0.5 capitalize"
          >
            {getDisplayLabel(address)}
          </Badge>
          {address.isPreferred && (
            <span className="text-xs text-blue-600 font-medium">Default</span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 leading-snug">{address.name}</p>
        {address.mobileNumber && (
          <p className="text-xs text-gray-500">{address.mobileNumber}</p>
        )}
        {addrLine && (
          <div className="flex items-start gap-1.5">
            <IconMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-snug">{addrLine}</p>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-1"
        onClick={onChangeClick}
      >
        Change
      </Button>
    </div>
  );
}
