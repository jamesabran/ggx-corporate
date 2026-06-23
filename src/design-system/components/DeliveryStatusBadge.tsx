import { Badge } from '../../app/components/ui/Badge';
import { cn } from '../../app/lib/utils';
import { DELIVERY_STATUSES, type DeliveryStatusKey } from '../data/deliveryStatus';

export interface DeliveryStatusBadgeProps {
  status: DeliveryStatusKey;
  /** Show the leading status icon. Default: true. */
  withIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Sample wrapper: maps a delivery status to the production `Badge` component.
 *
 * It supplies the status → variant/label/icon mapping (sample data + layout)
 * and renders the canonical `Badge` (app/components/ui/Badge.tsx) for all
 * visuals — it does not recreate badge styling. Intended for transaction lists
 * (one per row) and transaction detail headers. Wording per status is fixed and
 * concrete — never collapse states into a vague "Completed".
 */
export function DeliveryStatusBadge({ status, withIcon = true, size = 'md', className }: DeliveryStatusBadgeProps) {
  const def = DELIVERY_STATUSES[status];
  const Icon = def.icon;

  return (
    <Badge
      variant={def.variant}
      className={cn('gap-1', size === 'sm' && 'px-2 py-0.5 text-[11px]', className)}
    >
      {withIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} stroke={2} />}
      {def.label}
    </Badge>
  );
}

export type { DeliveryStatusKey };
