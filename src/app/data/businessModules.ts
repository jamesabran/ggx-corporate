/**
 * Account Add-ons catalog — the OPTIONAL account capabilities surfaced on the
 * Account Add-ons page (user-facing label). This is NOT a full feature catalog:
 * it lists only capabilities that are optional, gated, requestable, contract-
 * based, require setup/approval/dependencies, or are not yet fully available.
 *
 * Default / always-available features (Dashboard, Transactions, Bulk Booking,
 * Same-Day, Special Pickup, High-Volume, Shopify, API Integration, Webhooks,
 * etc.) are intentionally NOT listed here. Integrations (Shopify, API
 * Integration) live in their own sidebar group, not in Add-ons.
 *
 * Effective access STATUS + CTA are resolved in businessModulesService (never in
 * the UI). Contract inclusion + enablement are demo seeds standing in for the
 * future BFF. See docs/business_plus_modules.md and docs/contract_module_rules.md.
 */

import type { FeatureId } from './featureEnablement';

export type ModuleCategory = 'account_scale' | 'delivery_services' | 'commerce' | 'advanced';

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  account_scale: 'Account & Scale',
  delivery_services: 'Delivery Services',
  commerce: 'Commerce',
  advanced: 'Advanced',
};

/** Order categories appear on the Account Add-ons page. */
export const CATEGORY_ORDER: ModuleCategory[] = [
  'account_scale',
  'delivery_services',
  'commerce',
  'advanced',
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
  /** Whether the demo contract includes this add-on. */
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
  /**
   * When true, an unmet dependency renders a passive, non-actionable
   * "Requires X" CTA (the prerequisite is enabled elsewhere) instead of an
   * actionable "Enable X first" CTA.
   */
  dependencyPassive?: boolean;
  /** Gated feature whose runtime enablement overrides the defaults. */
  featureId?: FeatureId;
  /** Route to navigate to for Open / Set up / Continue setup. */
  route?: string;
  /** Route for a self-enable flow that has a real workflow (e.g. Subaccounts). */
  activateRoute?: string;
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
  // ── Account & Scale ──────────────────────────────────────────────────────────
  {
    id: 'subaccounts', name: 'Subaccounts', category: 'account_scale',
    description: 'Create and oversee subaccounts under a Main Account. Enabling converts your account into the first Subaccount under a new Main Account.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'account', availableFor: ['standard', 'main'], allowedRoles: ['admin'],
    route: '/dashboard/subaccounts', activateRoute: '/dashboard/subaccounts/enable',
    contractNote: 'Self-enable to start managing multiple accounts.',
  },
  {
    id: 'consolidated_billing', name: 'Consolidated Billing', category: 'account_scale',
    description: 'Roll up billing across subaccounts into a single statement.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ['main'], allowedRoles: ['admin'],
    dependsOn: 'subaccounts', dependencyPassive: true,
    contractNote: 'Requires Subaccounts. Activation may need a contract update.',
  },

  // ── Delivery Services ─────────────────────────────────────────────────────────
  {
    id: 'on_demand_delivery', name: 'On-Demand Delivery', category: 'delivery_services',
    description: 'Immediate, direct pickup and delivery — not consolidated. Separate from Same-Day Delivery.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'approval', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    coverageGated: true,
    contractNote: 'May require contract update, pricing approval, or operations approval.',
    coverageNote: 'Validated against the delivery address service area at booking time.',
  },

  // ── Commerce ──────────────────────────────────────────────────────────────────
  {
    id: 'inventory', name: 'Inventory', category: 'commerce',
    description: 'Manage products and stock. Products can be attached to booking rows and storefront listings.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin', 'manager'],
    featureId: 'inventory', route: '/dashboard/inventory',
    contractNote: 'Self-enable to start tracking products.',
  },
  {
    id: 'storefront', name: 'Storefront', category: 'commerce',
    description: 'Publish a simple storefront using your inventory products. Publish or unpublish anytime.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'self', scopeLevel: 'subaccount', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    dependsOn: 'inventory', featureId: 'storefront', route: '/dashboard/storefront',
    contractNote: 'Requires Inventory. Storefront products come from your inventory.',
  },

  // ── Advanced ────────────────────────────────────────────────────────────────────
  {
    id: 'advanced_analytics', name: 'Advanced Data Analytics', category: 'advanced',
    description: 'A dedicated analytics workspace: deeper filters, operational trends, subaccount comparisons, SLA/exception analysis, exportable views, and longer history. Distinct from dashboard Basic Analytics.',
    contractDefault: 'included', enabledByDefault: true, configuredByDefault: true,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ALL_ROLES,
    route: '/dashboard/analytics',
    contractNote: 'Included for your account. Managers see assigned subaccount data only.',
  },
  {
    id: 'custom_reports', name: 'Custom Reports', category: 'advanced',
    description: 'Choose columns, save report templates, combine module data, schedule exports, and group by subaccount. Goes beyond fixed Basic Reports templates.',
    contractDefault: 'excluded', enabledByDefault: false, configuredByDefault: false,
    activationMode: 'contract', scopeLevel: 'account', availableFor: ALL_TYPES, allowedRoles: ['admin'],
    contractNote: 'Activation may need a contract update.',
  },
];

export function getModuleById(id: string): BusinessModuleDef | undefined {
  return BUSINESS_MODULES.find((m) => m.id === id);
}
