import { cn } from '../../app/lib/utils';
import {
  DELIVERY_STATUSES,
  type DeliveryStatusKey,
} from '../data/deliveryStatus';

export interface DeliveryStatusBadgeProps {
  status: DeliveryStatusKey;
  /** Show the leading status icon. Default: true. */
  withIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Compact, semantic badge for a delivery's current status.
 *
 * Intended for transaction lists (one per row) and transaction detail headers.
 * Wording is fixed and concrete per status — do not pass free text, and never
 * collapse states into a vague "Completed".
 */
export function DeliveryStatusBadge({
  status,
  withIcon = true,
  size = 'md',
  className,
}: DeliveryStatusBadgeProps) {
  const def = DELIVERY_STATUSES[status];
  const Icon = def.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        def.className,
        className,
      )}
    >
      {withIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} stroke={2} />}
      {def.label}
    </span>
  );
}

export type { DeliveryStatusKey };
