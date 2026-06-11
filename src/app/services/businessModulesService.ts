/**
 * Business Modules service facade — resolves each catalog module to an effective
 * ACCESS STATUS and CTA for the current viewer context. This is the single source
 * of truth for module status/CTA; the UI only renders the result.
 *
 * Access logic (contract, approval, dependency, coverage, role) is a service/BFF
 * concern, not frontend computation. Currently backed by data/businessModules.ts
 * + featureEnablementService.
 *
 * Future BFF:
 *   GET /business-modules                 → catalog
 *   GET /accounts/:id/modules             → per-account contract + enablement
 *
 * See docs/business_plus_modules.md and docs/contract_module_rules.md.
 */

import {
  BUSINESS_MODULES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getModuleById,
  type AccountType,
  type BusinessModuleDef,
  type ModuleCategory,
  type ModuleRole,
} from '../data/businessModules';
import { getFeatureStateSync } from './featureEnablementService';
import { hasPermission, type PermissionKey } from '../data/permissions';

export type {
  AccountType, BusinessModuleDef, ModuleCategory, ModuleRole,
};
export { CATEGORY_LABELS, CATEGORY_ORDER };

export type ModuleAccessStatus =
  | 'included'
  | 'available_to_activate'
  | 'enabled'
  | 'requires_setup'
  | 'requires_approval'
  | 'requires_contract_revision'
  | 'requires_dependency'
  | 'not_available'
  | 'coming_soon';

export interface ModuleAccessContext {
  accountType: AccountType;
  role: ModuleRole;
  /** Current subaccount id, when scoped (else undefined for Main/consolidated). */
  scopeAccountId?: string;
  permissions: PermissionKey[];
  /** Service-area coverage check result for coverage-gated modules. */
  serviceCoverageOk?: boolean;
  /** Whether Subaccounts are enabled (drives the Subaccounts add-on + dependents). */
  subaccountsEnabled?: boolean;
}

export type CtaKind =
  | 'open'
  | 'setup'
  | 'continue'
  | 'enable'
  | 'request_approval'
  | 'request_activation'
  | 'dependency'
  | 'contact'
  | 'coming_soon';

export interface ModuleCta {
  label: string;
  kind: CtaKind;
  /** Route to navigate to (Open / Set up / Continue setup / dependency target). */
  route?: string;
  /** Whether the CTA is non-actionable (coming soon, or role-blocked activation). */
  disabled: boolean;
}

// ─── status presentation meta ──────────────────────────────────────────────────

export const STATUS_META: Record<ModuleAccessStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'success' | 'info' | 'warning' | 'danger' | 'pending';
}> = {
  enabled:                     { label: 'Enabled',          variant: 'success' },
  included:                    { label: 'Included',         variant: 'info' },
  available_to_activate:       { label: 'Available',        variant: 'info' },
  requires_setup:              { label: 'Setup required',   variant: 'warning' },
  requires_approval:           { label: 'Requires approval',variant: 'warning' },
  requires_contract_revision:  { label: 'Contract upgrade', variant: 'pending' },
  requires_dependency:         { label: 'Locked',           variant: 'default' },
  not_available:               { label: 'Not available',    variant: 'default' },
  coming_soon:                 { label: 'Coming soon',      variant: 'outline' },
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  standard: 'Standard Account',
  main: 'Main Account',
  subaccount: 'Subaccount',
};

const ROLE_LABELS: Record<ModuleRole, string> = { admin: 'Admin', manager: 'Manager' };

// ─── status resolution ──────────────────────────────────────────────────────────

/** Whether a module's prerequisite (dependsOn) is enabled+configured for the scope. */
function isDependencySatisfied(depId: string, ctx: ModuleAccessContext): boolean {
  // Subaccounts enablement is runtime state (SubAccountContext), not a feature flag.
  if (depId === 'subaccounts') return !!ctx.subaccountsEnabled;
  const dep = getModuleById(depId);
  if (!dep) return true;
  if (dep.featureId) {
    return getFeatureStateSync(dep.featureId, ctx.scopeAccountId).enabled;
  }
  return dep.contractDefault === 'included' && dep.enabledByDefault;
}

/**
 * Resolve the effective access status for a module in a viewer context.
 * Order matters (first match wins) — see docs/contract_module_rules.md.
 */
export function resolveModuleAccess(m: BusinessModuleDef, ctx: ModuleAccessContext): ModuleAccessStatus {
  if (!m.availableFor.includes(ctx.accountType)) return 'not_available';
  if (m.comingSoon) return 'coming_soon';
  if (m.dependsOn && !isDependencySatisfied(m.dependsOn, ctx)) return 'requires_dependency';
  if (m.coverageGated && ctx.serviceCoverageOk === false) return 'not_available';

  // Subaccounts is a self-enable scale feature driven by runtime SubAccount state.
  if (m.id === 'subaccounts') return ctx.subaccountsEnabled ? 'enabled' : 'available_to_activate';

  const fe = m.featureId ? getFeatureStateSync(m.featureId, ctx.scopeAccountId) : undefined;
  const included = m.contractDefault === 'included';
  const enabled = fe ? fe.enabled : m.enabledByDefault;
  const configured = fe ? fe.configured : m.configuredByDefault;

  if (!included) {
    switch (m.activationMode) {
      case 'self': return 'available_to_activate';
      case 'approval': return 'requires_approval';
      case 'contract': return 'requires_contract_revision';
      default: return 'not_available';
    }
  }
  if (enabled && configured) return 'enabled';
  if (enabled && !configured) return 'requires_setup';
  return 'included';
}

/** Resolve the CTA for a status. Single source of truth for CTA text. */
export function resolveCta(status: ModuleAccessStatus, m: BusinessModuleDef): ModuleCta {
  switch (status) {
    case 'enabled':
      return { label: 'Open', kind: 'open', route: m.route, disabled: !m.route };
    case 'included':
      return { label: 'Set up', kind: 'setup', route: m.route, disabled: false };
    case 'requires_setup':
      return { label: 'Continue setup', kind: 'continue', route: m.route, disabled: false };
    case 'available_to_activate':
      // Self-enable flows with a real workflow (e.g. Subaccounts) route directly;
      // others (Inventory/Storefront) are handled by the page's activation flow.
      return { label: 'Enable', kind: 'enable', route: m.activateRoute, disabled: false };
    case 'requires_approval':
      return { label: 'Submit request', kind: 'request_approval', disabled: false };
    case 'requires_contract_revision':
      return { label: 'Request activation', kind: 'request_activation', disabled: false };
    case 'requires_dependency': {
      const dep = m.dependsOn ? getModuleById(m.dependsOn) : undefined;
      return {
        label: dep ? `Enable ${dep.name} first` : 'Enable dependency first',
        kind: 'dependency',
        route: dep?.route,
        disabled: false,
      };
    }
    case 'not_available':
      return { label: 'Contact support', kind: 'contact', disabled: false };
    case 'coming_soon':
      return { label: 'Coming soon', kind: 'coming_soon', disabled: true };
  }
}

// ─── resolved module view-model ──────────────────────────────────────────────────

export interface ResolvedModule {
  def: BusinessModuleDef;
  status: ModuleAccessStatus;
  cta: ModuleCta;
  categoryLabel: string;
  availableForLabels: string[];
  allowedRoleLabels: string[];
  contractNote?: string;
  dependencyNote?: string;
  coverageNote?: string;
  /** True when an activation CTA is blocked for this role (e.g. manager). */
  activationBlocked: boolean;
  /** Note explaining a blocked/role-gated CTA. */
  blockedNote?: string;
}

const ACTIVATION_CTA_KINDS: CtaKind[] = ['enable', 'request_approval', 'request_activation'];

function buildResolved(m: BusinessModuleDef, ctx: ModuleAccessContext): ResolvedModule {
  const status = resolveModuleAccess(m, ctx);
  const cta = resolveCta(status, m);

  // Managers cannot activate/request account-level (global) modules.
  let activationBlocked = false;
  let blockedNote: string | undefined;
  if (ACTIVATION_CTA_KINDS.includes(cta.kind) && m.scopeLevel === 'account') {
    const needed: PermissionKey = cta.kind === 'enable' ? 'modules.activate' : 'modules.request';
    if (!hasPermission(ctx.permissions, needed)) {
      activationBlocked = true;
      blockedNote = 'Requires an account administrator.';
      cta.disabled = true;
    }
  }

  const dependencyNote = m.dependsOn
    ? `Requires ${getModuleById(m.dependsOn)?.name ?? 'another module'} first.`
    : undefined;

  return {
    def: m,
    status,
    cta,
    categoryLabel: CATEGORY_LABELS[m.category],
    availableForLabels: m.availableFor.map((t) => ACCOUNT_TYPE_LABELS[t]),
    allowedRoleLabels: m.allowedRoles.map((r) => ROLE_LABELS[r]),
    contractNote: m.contractNote,
    dependencyNote,
    coverageNote: m.coverageNote,
    activationBlocked,
    blockedNote,
  };
}

/**
 * Return the full module catalog resolved for a viewer context, grouped by
 * category in display order. Modules not available for the viewer's account type
 * are included with `not_available` status so the platform direction stays
 * visible (per product direction) — the UI may choose to de-emphasize them.
 */
export async function getModuleCatalog(
  ctx: ModuleAccessContext
): Promise<{ category: ModuleCategory; label: string; modules: ResolvedModule[] }[]> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    modules: BUSINESS_MODULES.filter((m) => m.category === category).map((m) => buildResolved(m, ctx)),
  })).filter((group) => group.modules.length > 0);
}

/** Resolve a single module for a context (used by enablement gates). */
export async function getResolvedModule(
  moduleId: string,
  ctx: ModuleAccessContext
): Promise<ResolvedModule | null> {
  const m = getModuleById(moduleId);
  return m ? buildResolved(m, ctx) : null;
}
