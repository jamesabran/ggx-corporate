/**
 * moduleActivationService — performs the real activation/request action behind an
 * Account Add-on CTA. Replaces the previous no-op acknowledge dialog.
 *
 *  - Self-enable add-ons (Inventory / Storefront) flip runtime feature enablement
 *    for the scope, making them immediately usable (→ "Enabled" / Open).
 *  - Approval / contract add-ons submit a persisted request the catalog then
 *    reflects as "Request submitted" (no duplicate submits).
 *
 * Activation outcomes are presentation-shaped; the underlying state lives in the
 * feature-enablement + module-request stores. Future BFF:
 *   POST /accounts/:id/features/:featureId/enable
 *   POST /accounts/:id/module-requests
 */

import { enableFeature } from './featureEnablementService';
import { submitModuleRequest, type ModuleRequestKind } from '../data/moduleRequests';
import type { ModuleAccessContext, ResolvedModule } from './businessModulesService';

export type ActivationOutcomeKind = 'enabled' | 'requested' | 'contact';

export interface ActivationOutcome {
  kind: ActivationOutcomeKind;
  title: string;
  message: string;
  /** Route to continue (e.g. setup) after a successful self-enable. */
  route?: string;
}

/**
 * Run the activation action for a resolved add-on CTA in a viewer context.
 * Returns a presentation-shaped outcome the dialog renders as a success view.
 */
export async function activateModule(
  ctx: ModuleAccessContext,
  module: ResolvedModule,
): Promise<ActivationOutcome> {
  const { def, cta } = module;

  if (cta.kind === 'enable') {
    if (def.featureId) {
      await enableFeature(def.featureId, ctx.scopeAccountId);
      return {
        kind: 'enabled',
        title: `${def.name} enabled`,
        message: `${def.name} is now enabled for this account and ready to use.`,
        route: def.route,
      };
    }
    return {
      kind: 'enabled',
      title: `${def.name} enabled`,
      message: `${def.name} is now enabled for this account.`,
      route: def.route,
    };
  }

  if (cta.kind === 'request_approval' || cta.kind === 'request_activation') {
    submitModuleRequest(ctx.scopeAccountId, def.id, cta.kind as ModuleRequestKind);
    return {
      kind: 'requested',
      title: 'Request submitted',
      message: `Your request for ${def.name} has been submitted. Your GGX account team will review it and follow up.`,
    };
  }

  return {
    kind: 'contact',
    title: `Contact support — ${def.name}`,
    message: `${def.name} isn't available for this account type or service area yet. Our team can help you explore options.`,
  };
}
