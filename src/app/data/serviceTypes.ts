/**
 * Delivery service types for GGX Business+.
 *
 * Same-Day and On-Demand are DISTINCT types — never merge them. See
 * docs/service_type_rules.md. Availability per account/subaccount and service-
 * area coverage are backend/service contracts; the frontend only presents them.
 */

export type ServiceTypeKey =
  | 'standard'
  | 'same_day'
  | 'on_demand'
  | 'special_pickup'
  | 'high_volume';

export interface ServiceTypeDef {
  key: ServiceTypeKey;
  label: string;
  /** One-line description for selectors and option lists. */
  description: string;
  /** Whether availability must be validated against service-area coverage. */
  coverageGated: boolean;
}

export const SERVICE_TYPES: Record<ServiceTypeKey, ServiceTypeDef> = {
  standard: {
    key: 'standard',
    label: 'Standard Delivery',
    description: 'Default bulk delivery.',
    coverageGated: false,
  },
  same_day: {
    key: 'same_day',
    label: 'Same-Day Delivery',
    description: 'Consolidated, batch-like handling delivered within the day. Subject to cut-off, service area, and capacity.',
    coverageGated: true,
  },
  on_demand: {
    key: 'on_demand',
    label: 'On-Demand Delivery',
    description: 'Immediate, direct pickup and delivery — not consolidated. May require contract revision, pricing approval, or coverage validation.',
    coverageGated: true,
  },
  special_pickup: {
    key: 'special_pickup',
    label: 'Special Pickup Support',
    description: 'Assisted or large-volume pickup support.',
    coverageGated: false,
  },
  high_volume: {
    key: 'high_volume',
    label: 'High-Volume Fulfillment',
    description: 'Contract-gated fulfillment at scale.',
    coverageGated: false,
  },
};

/** Service types selectable on a booking row (delivery, not fulfillment tiers). */
export const BOOKING_SERVICE_TYPES: ServiceTypeKey[] = ['standard', 'same_day', 'on_demand'];

/** Delivery options a storefront may offer to customers. */
export const STOREFRONT_DELIVERY_OPTIONS: ServiceTypeKey[] = ['standard', 'same_day', 'on_demand'];

export function getServiceTypeLabel(key: ServiceTypeKey): string {
  return SERVICE_TYPES[key]?.label ?? key;
}
