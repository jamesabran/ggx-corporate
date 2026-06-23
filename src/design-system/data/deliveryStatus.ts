/**
 * Delivery status variant data for the GoGo Xpress Design System sample.
 *
 * These are presentation-facing delivery statuses used in transaction lists and
 * detail views. Keep wording concrete — never a vague "Completed". The canonical
 * delivery lifecycle and its transitions are backend/service-owned; this only
 * describes how each status is presented.
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
  /** Tailwind classes for the badge surface (bg + text + ring). */
  className: string;
  /** Dot color class for the compact indicator. */
  dotClassName: string;
  icon: ComponentType<IconProps>;
  /** Semantic family this status maps to. */
  tone: 'pending' | 'warning' | 'info' | 'success' | 'error';
  /** Plain-language meaning for documentation. */
  meaning: string;
}

export const DELIVERY_STATUSES: Record<DeliveryStatusKey, DeliveryStatusDef> = {
  awaiting_payment: {
    key: 'awaiting_payment',
    label: 'Awaiting Payment',
    className: 'bg-orange-100 text-orange-800 ring-orange-200',
    dotClassName: 'bg-orange-500',
    icon: IconClockDollar,
    tone: 'pending',
    meaning: 'Booking placed but payment is not yet settled. Blocks pickup.',
  },
  needs_review: {
    key: 'needs_review',
    label: 'Needs Review',
    className: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    dotClassName: 'bg-yellow-500',
    icon: IconAlertTriangle,
    tone: 'warning',
    meaning: 'Flagged for attention — invalid address, missing field, or a data issue to resolve.',
  },
  for_pickup: {
    key: 'for_pickup',
    label: 'For Pickup',
    className: 'bg-sky-100 text-sky-800 ring-sky-200',
    dotClassName: 'bg-sky-500',
    icon: IconPackage,
    tone: 'info',
    meaning: 'Ready and scheduled for rider pickup. Not yet collected.',
  },
  in_transit: {
    key: 'in_transit',
    label: 'In Transit',
    className: 'bg-blue-100 text-blue-800 ring-blue-200',
    dotClassName: 'bg-blue-600',
    icon: IconTruckDelivery,
    tone: 'info',
    meaning: 'Picked up and moving through the network toward the recipient.',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 ring-green-200',
    dotClassName: 'bg-green-600',
    icon: IconCircleCheck,
    tone: 'success',
    meaning: 'Successfully handed over to the recipient. Terminal success state.',
  },
  cancelled: {
    key: 'cancelled',
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 ring-red-200',
    dotClassName: 'bg-red-500',
    icon: IconCircleX,
    tone: 'error',
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
