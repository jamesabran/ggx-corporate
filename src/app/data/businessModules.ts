/**
 * Business Modules catalog — the offerings surfaced on the Business Modules page.
 *
 * Each module declares its category, contract default, activation mode, scope
 * level, dependencies, and the account types/roles it's available for. Effective
 * access STATUS and CTA are resolved in businessModulesService (never in the UI).
 *
 * Contract inclusion + enablement here are demo seeds standing in for the future
 * BFF (GET /business-modules, GET /accounts/:id/modules). See
 * docs/business_plus_modules.md and docs/contract_module_rules.md.
 */

import type { FeatureId } from './featureEnablement';

export type ModuleCategory =
  | 'core_workspace'
  | 'advanced_analytics'
  | 'delivery_services'
  | 'commerce'
  | 'scale'
  | 'integrations'
  | 'booking_tools';

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core_workspace: 'Core Workspace',
  advanced_analytics: 'Advanced Analytics',
  delivery_services: 'Delivery Services',
  commerce: 'Commerce',
  scale: 'Scale',
  integrations: 'Integrations',
  booking_tools: 'Booking Tools',
};

/** Order categories appear on the Business Modules page. */
export const CATEGORY_ORDER: ModuleCategory[] = [
  'core_workspace',
  'booking_tools',
  'delivery_services',
  'commerce',
  'advanced_analytics',
  'scale',
  'integrations',
];

export type AccountType = 'standard' | 'main' | 'subaccount';
export type ModuleRole = 'admin' | 'manager';

/** How a non-included module can be activated. `none` → not_available. */
export type ActivationMode = 'self' | 'approval' | 'contract' | 'none';

/** account = Main controls it, subaccounts inherit; subaccount = per-subaccount. */
export type ScopeLevel = 'account' | 'subaccount';

export interface BusinessModuleDef {
  id: string;
  name: string;
  category: ModuleCategory;
  description: string;
  /** Whether the demo contract includes this module. */
  contractDefault: 'included' | 'excluded';
  /** Default enabled/configured state when there is no per-scope feature flag. */
  enabledByDefault: boolean;
  configuredByDefault: boolean;
  activationMode: ActivationMode;
  scopeLevel: ScopeLevel;
  availableFor: AccountType[];
  allowedRoles: ModuleRole[];
  /** Module id that must be enabled first (dependency gate). */
  dependsOn?: string;
  /** Gated feature whose runtime enablement overrides the defaults. */
  featureId?: FeatureId;
  /** Existing route to navigate to for Open/Set up (when applicable). */
  route?: string;
  /** Validate against service-area coverage at point of use. */
  coverageGated?: boolean;
  /** Not yet released. */
  comingSoon?: boolean;
  /** Short contract/access note shown on the card. */
  contractNote?: string;
  /** Service coverage note shown on the card when relevant. */
  coverageNote?: string;
}

const ALL_TYPES: AccountType[] = ['standard', 'main', 'subaccount'];
const ALL_ROLES: ModuleRole[] = ['admin', 'manager'];

export const BUSINESS_MODULES: BusinessModuleDef[] = [
  // ── A. Core Workspace (default / included) ──────────────────────────────────
  { id: 'dashboard', name: 'Dashboard', category: 'core_workspace',
    description: 'Operational overview with Basic Analytics: bookings, deliveries, pending pickups, and recent activity.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard', contractNote: 'Included in every account.' },
  { id: 'transactions', name: 'Transactions', category: 'core_workspace',
    description: 'Track and filter shipments across batches and accounts.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/transactions', contractNote: 'Included in every account.' },
  { id: 'address_book', name: 'Address Book', category: 'core_workspace',
    description: 'Shared sender and recipient addresses for bulk operations.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/address-book', contractNote: 'Included in every account.' },
  { id: 'support_tickets', name: 'Support Tickets', category: 'core_workspace',
    description: 'Resolve delivery, billing, and tracking issues.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/support-tickets', contractNote: 'Included in every account.' },

  // ── G. Booking Tools ────────────────────────────────────────────────────────
  { id: 'bulk_booking', name: 'Bulk Booking', category: 'booking_tools',
    description: 'Book shipments in bulk by uploading a file or typing in an in-app spreadsheet.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/bulk-uploader', contractNote: 'Included. Supports Upload File and Type in Spreadsheet.' },

  // ── C. Delivery Services ─────────────────────────────────────────────────────
  { id: 'standard_delivery', name: 'Standard Delivery', category: 'delivery_services',
    description: 'Default bulk delivery service.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/bulk-uploader', contractNote: 'Included in every account.' },
  { id: 'same_day_delivery', name: 'Same-Day Delivery', category: 'delivery_services',
    description: 'Consolidated, batch-like handling delivered within the day. Subject to cut-off, service area, and capacity.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    coverageGated: true, contractNote: 'Enable for eligible service areas.',
    coverageNote: 'Availability depends on cut-off and service-area coverage.' },
  { id: 'on_demand_delivery', name: 'On-Demand Delivery', category: 'delivery_services',
    description: 'Immediate, direct pickup and delivery — not consolidated. "Pickup and deliver now."',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'approval', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    coverageGated: true, contractNote: 'Requires pricing approval or contract revision.',
    coverageNote: 'Validated against the delivery address service area at booking time.' },
  { id: 'special_pickup', name: 'Special Pickup Support', category: 'delivery_services',
    description: 'Assisted or large-volume pickup support.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    contractNote: 'Self-enable for your account.' },
  { id: 'high_volume_fulfillment', name: 'High-Volume Fulfillment', category: 'delivery_services',
    description: 'Contract-gated fulfillment at scale.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ['main', 'standard'], allowedRoles: ['admin'],
    contractNote: 'Requires a contract upgrade.' },

  // ── D. Commerce ──────────────────────────────────────────────────────────────
  { id: 'inventory', name: 'Inventory', category: 'commerce',
    description: 'Manage products that can be attached to booking rows and storefront listings.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin', 'manager'],
    featureId: 'inventory', route: '/dashboard/inventory',
    contractNote: 'Self-enable to start tracking products.' },
  { id: 'storefront', name: 'Storefront', category: 'commerce',
    description: 'Publish a simple storefront using your inventory products.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    dependsOn: 'inventory', featureId: 'storefront', route: '/dashboard/storefront',
    contractNote: 'Requires Inventory. Products come from your inventory.' },
  { id: 'product_linked_booking', name: 'Product-linked Booking', category: 'commerce',
    description: 'Attach inventory products to bulk-booking rows and auto-fill product details.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin', 'manager'],
    dependsOn: 'inventory', contractNote: 'Requires Inventory.' },
  { id: 'storefront_orders', name: 'Storefront Orders', category: 'commerce',
    description: 'View and manage orders placed through your storefront.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    dependsOn: 'storefront', comingSoon: true, contractNote: 'Available after Storefront launch.' },

  // ── B. Advanced Analytics ────────────────────────────────────────────────────
  { id: 'advanced_analytics', name: 'Advanced Analytics', category: 'advanced_analytics',
    description: 'Deeper trends, SLA insights, failed-delivery analysis, comparisons, and downloadable reports.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/analytics', contractNote: 'Included for your account. Managers see assigned subaccount data only.' },

  // ── E. Scale ─────────────────────────────────────────────────────────────────
  { id: 'subaccounts', name: 'Subaccounts', category: 'scale',
    description: 'Create and oversee subaccounts under a Main Account.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'self', scopeLevel: 'account', availableFor: ['standard', 'main'], allowedRoles: ['admin'],
    route: '/dashboard/subaccounts', contractNote: 'Enabling converts your account into the first Subaccount under a new Main Account.' },
  { id: 'users_permissions', name: 'Users & Permissions', category: 'scale',
    description: 'Manage users and assign managers to subaccounts.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ['main'], allowedRoles: ['admin'],
    route: '/dashboard/users-permissions', contractNote: 'Available on Main Accounts.' },
  { id: 'consolidated_billing', name: 'Consolidated Billing', category: 'scale',
    description: 'Roll up billing across subaccounts into a single statement.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'none', scopeLevel: 'account', availableFor: ['main'], allowedRoles: ['admin'],
    route: '/dashboard/billing', contractNote: 'Available on Main Accounts.' },
  { id: 'branch_brand_management', name: 'Branch / Brand Management', category: 'scale',
    description: 'Organize operations by branch and brand.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ['main', 'standard'], allowedRoles: ['admin'],
    comingSoon: true },

  // ── F. Integrations ──────────────────────────────────────────────────────────
  { id: 'api_integration', name: 'API Integration', category: 'integrations',
    description: 'Connect your systems to GGX with API access and activity logs.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'approval', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin', 'manager'],
    route: '/dashboard/api-access', contractNote: 'Included. If not configured, set up your credentials.' },
  { id: 'developer_credentials', name: 'Developer Credentials', category: 'integrations',
    description: 'Issue and rotate API keys and developer credentials.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'approval', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    contractNote: 'Requires approval.' },
  { id: 'webhooks', name: 'Webhooks', category: 'integrations',
    description: 'Receive event callbacks for bookings, pickups, and delivery updates.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'approval', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    contractNote: 'Requires approval.' },
  { id: 'external_store_integration', name: 'External Store Integration', category: 'integrations',
    description: 'Connect an external online store to book pickups through GGX.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    contractNote: 'Self-enable to connect a supported store platform.' },
  { id: 'order_import', name: 'Order Import', category: 'integrations',
    description: 'Import orders in bulk from external sources.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    comingSoon: true },
];

export function getModuleById(id: string): BusinessModuleDef | undefined {
  return BUSINESS_MODULES.find((m) => m.id === id);
}
