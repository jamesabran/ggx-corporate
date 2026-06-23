/**
 * Delivery status variant data for the GoGo Xpress Design System sample.
 *
 * These presentation-facing statuses are rendered by the production `Badge`
 * component (`app/components/ui/Badge.tsx`) — this file only maps each status to
 * a real Badge `variant` plus a label and an icon. It does NOT define its own
 * colors. Keep wording concrete — never a vague "Completed". The canonical
 * delivery lifecycle and its transitions are backend/service-owned.
 */

import {
  IconClockDollar,
  IconAlertTriangle,
  IconPackage,
  IconTruckDelivery,
  IconCircleCheck,
  IconCircleX,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import type { BadgeProps } from '../../app/components/ui/Badge';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export type DeliveryStatusKey =
  | 'awaiting_payment'
  | 'needs_review'
  | 'for_pickup'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface DeliveryStatusDef {
  key: DeliveryStatusKey;
  label: string;
  /** Real production Badge variant used to render this status. */
  variant: BadgeVariant;
  icon: ComponentType<IconProps>;
  /** Plain-language meaning for documentation. */
  meaning: string;
}

export const DELIVERY_STATUSES: Record<DeliveryStatusKey, DeliveryStatusDef> = {
  awaiting_payment: {
    key: 'awaiting_payment',
    label: 'Awaiting Payment',
    variant: 'pending',
    icon: IconClockDollar,
    meaning: 'Booking placed but payment is not yet settled. Blocks pickup.',
  },
  needs_review: {
    key: 'needs_review',
    label: 'Needs Review',
    variant: 'warning',
    icon: IconAlertTriangle,
    meaning: 'Flagged for attention — invalid address, missing field, or a data issue to resolve.',
  },
  for_pickup: {
    key: 'for_pickup',
    label: 'For Pickup',
    variant: 'info',
    icon: IconPackage,
    meaning: 'Ready and scheduled for rider pickup. Not yet collected.',
  },
  in_transit: {
    key: 'in_transit',
    label: 'In Transit',
    variant: 'info',
    icon: IconTruckDelivery,
    meaning: 'Picked up and moving through the network toward the recipient.',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered',
    variant: 'success',
    icon: IconCircleCheck,
    meaning: 'Successfully handed over to the recipient. Terminal success state.',
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    variant: 'danger',
    icon: IconCircleX,
    meaning: 'Booking was cancelled before completion. Terminal, non-success.',
  },
};

/** Display order for lists, filters, and the documentation grid. */
export const DELIVERY_STATUS_ORDER: DeliveryStatusKey[] = [
  'awaiting_payment',
  'needs_review',
  'for_pickup',
  'in_transit',
  'delivered',
  'cancelled',
];
