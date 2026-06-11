import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconLock, IconChevronLeft } from '@tabler/icons-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { getResolvedModule, type ResolvedModule } from '../services/businessModulesService';

const BUSINESS_MODULES_ROUTE = '/dashboard/business-modules';

/**
 * Locked state shown when a user opens a gated feature route (Inventory,
 * Storefront, …) that isn't usable for their scope. Resolves the module's access
 * status + CTA from the service and presents a status-appropriate message.
 *
 * Never exposes feature data, and never lets a role-blocked user activate a
 * global module (the CTA mirrors the module card's blocked state). Activation
 * CTAs route to Business Modules where the request flow lives.
 *
 * See docs/feature_enablement_rules.md.
 */
export function EnablementGate({ moduleId }: { moduleId: string }) {
  const ctx = useModuleAccessContext();
  const navigate = useNavigate();
  const [module, setModule] = useState<ResolvedModule | null>(null);

  useEffect(() => {
    let active = true;
    getResolvedModule(moduleId, ctx).then((m) => { if (active) setModule(m); });
    return () => { active = false; };
  }, [moduleId, ctx]);

  if (!module) return null;

  const { def, status, cta } = module;

  const message = MESSAGES[status]?.(def.name)
    ?? `${def.name} isn't available for this account.`;

  const handleCta = () => {
    if (cta.disabled) return;
    if (cta.route) { navigate(cta.route); return; }
    // Activation/request CTAs are handled on the Business Modules page.
    navigate(BUSINESS_MODULES_ROUTE);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(BUSINESS_MODULES_ROUTE)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer transition-colors"
      >
        <IconChevronLeft className="w-4 h-4" /> Business Modules
      </button>
      <Card>
        <CardContent className="py-12 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <IconLock className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{def.name}</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{message}</p>
          {module.activationBlocked && module.blockedNote && (
            <p className="text-xs text-gray-400 mt-2">{module.blockedNote}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant={cta.kind === 'dependency' ? 'default' : 'outline'} disabled={cta.disabled} onClick={handleCta}>
              {cta.label}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const MESSAGES: Partial<Record<ResolvedModule['status'], (name: string) => string>> = {
  available_to_activate: (n) => `${n} isn't enabled for this account yet. Enable it to get started.`,
  requires_setup: (n) => `${n} is enabled but needs setup before you can use it.`,
  included: (n) => `${n} is included in your contract but hasn't been set up yet.`,
  requires_approval: (n) => `${n} requires an approved request before it can be used.`,
  requires_contract_revision: (n) => `${n} requires a contract update before it can be activated.`,
  requires_dependency: (n) => `${n} needs another module enabled first.`,
  not_available: (n) => `${n} isn't available for this account type or service area.`,
  coming_soon: (n) => `${n} is coming soon.`,
};
