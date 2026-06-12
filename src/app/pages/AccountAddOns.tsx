import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconCircleCheck, IconClockHour4, IconLoader2 } from '@tabler/icons-react';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ModuleCard } from '../components/ModuleCard';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import {
  getModuleCatalog,
  type ModuleCategory,
  type ResolvedModule,
} from '../services/businessModulesService';
import { activateModule, type ActivationOutcome } from '../services/moduleActivationService';
import { approveModuleRequest } from '../data/moduleRequests';

type Phase = 'confirm' | 'submitting' | 'done';

/**
 * Account Add-ons — the discovery surface for OPTIONAL account capabilities.
 * Status + CTA are resolved by businessModulesService.
 *
 * Activation/request CTAs run a REAL action via moduleActivationService:
 * self-enable add-ons (Inventory/Storefront) flip feature enablement, and
 * approval/contract add-ons submit a persisted request the catalog reflects as
 * "Request submitted". Routed CTAs (Open / Set up / dependency) navigate.
 */
export function AccountAddOns() {
  const ctx = useModuleAccessContext();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<{ category: ModuleCategory; label: string; modules: ResolvedModule[] }[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'available' | 'locked'>('all');

  const [actioned, setActioned] = useState<ResolvedModule | null>(null);
  const [phase, setPhase] = useState<Phase>('confirm');
  const [outcome, setOutcome] = useState<ActivationOutcome | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    getModuleCatalog(ctx).then(setGroups);
  }, [ctx]);

  useEffect(() => {
    let active = true;
    getModuleCatalog(ctx).then((g) => { if (active) setGroups(g); });
    return () => { active = false; };
  }, [ctx]);

  const openAction = (m: ResolvedModule) => {
    setActioned(m);
    setPhase('confirm');
    setOutcome(null);
  };

  const closeDialog = () => {
    setActioned(null);
    setPhase('confirm');
    setOutcome(null);
  };

  const handleConfirm = async () => {
    if (!actioned) return;
    setPhase('submitting');
    const result = await activateModule(ctx, actioned);
    setOutcome(result);
    setPhase('done');
    reload(); // refresh statuses/CTAs (enabled / request submitted)
  };

  // Demo-only: simulate the GGX account team approving a pending request. Flips
  // the request to approved (catalog → enabled/available), toasts, and refreshes.
  const handleSimulateApproval = (m: ResolvedModule) => {
    approveModuleRequest(ctx.scopeAccountId, m.def.id);
    setToast(`${m.def.name} approved by your GGX account team — it's now active.`);
    reload();
    window.setTimeout(() => setToast(null), 4000);
  };

  const filteredGroups = useMemo(() => {
    if (filter === 'all') return groups;
    const match = (m: ResolvedModule) => {
      if (filter === 'active') return m.status === 'enabled' || m.status === 'requires_setup' || m.status === 'included';
      if (filter === 'available') return m.status === 'available_to_activate';
      return ['requires_approval', 'requires_contract_revision', 'requires_dependency', 'not_available', 'coming_soon'].includes(m.status);
    };
    return groups
      .map((g) => ({ ...g, modules: g.modules.filter(match) }))
      .filter((g) => g.modules.length > 0);
  }, [groups, filter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Add-ons</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Add optional capabilities to your account. Some add-ons may require setup, approval,
            service coverage, or contract updates.
          </p>
        </div>
        <div className="w-44">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All add-ons</option>
            <option value="active">Active &amp; included</option>
            <option value="available">Available to enable</option>
            <option value="locked">Locked &amp; upcoming</option>
          </Select>
        </div>
      </div>

      {filteredGroups.map((group, i) => (
        <section key={group.category} className={i > 0 ? 'pt-6 border-t border-gray-200' : undefined}>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{group.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.modules.map((m) => (
              <ModuleCard
                key={m.def.id}
                module={m}
                onAction={openAction}
                onSimulateApproval={handleSimulateApproval}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-12">No add-ons match this filter.</p>
      )}

      <Dialog
        open={!!actioned}
        onClose={phase === 'submitting' ? () => {} : closeDialog}
        title={actioned ? (phase === 'done' && outcome ? outcome.title : actionTitle(actioned)) : ''}
        size="sm"
      >
        {actioned && phase !== 'done' && (
          <>
            <p className="text-sm text-gray-600">{actionBody(actioned)}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog} disabled={phase === 'submitting'}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={phase === 'submitting'}>
                {phase === 'submitting'
                  ? <><IconLoader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : actioned.cta.label}
              </Button>
            </div>
          </>
        )}

        {actioned && phase === 'done' && outcome && (
          <>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${outcome.kind === 'requested' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {outcome.kind === 'requested'
                  ? <IconClockHour4 className="w-5 h-5 text-blue-600" />
                  : <IconCircleCheck className="w-5 h-5 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 flex-1">{outcome.message}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              {outcome.kind === 'enabled' && outcome.route ? (
                <>
                  <Button variant="outline" onClick={closeDialog}>Close</Button>
                  <Button onClick={() => { const r = outcome.route!; closeDialog(); navigate(r); }}>
                    Open {actioned.def.name}
                  </Button>
                </>
              ) : (
                <Button onClick={closeDialog}>Done</Button>
              )}
            </div>
          </>
        )}
      </Dialog>

      {/* Demo approval toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
          <div className="flex items-start gap-2.5 rounded-xl bg-gray-900 text-white shadow-xl px-4 py-3">
            <IconCircleCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function actionTitle(m: ResolvedModule): string {
  switch (m.cta.kind) {
    case 'enable': return `Enable ${m.def.name}`;
    case 'request_approval': return `Request ${m.def.name}`;
    case 'request_activation': return `Request activation — ${m.def.name}`;
    case 'contact': return `Contact support — ${m.def.name}`;
    default: return m.def.name;
  }
}

function actionBody(m: ResolvedModule): string {
  switch (m.cta.kind) {
    case 'enable':
      return `${m.def.name} can be enabled for your account. Confirm to turn it on and start using it right away.`;
    case 'request_approval':
      return `${m.def.name} requires approval. Submitting will send a request to your GGX account team for review.`;
    case 'request_activation':
      return `${m.def.name} requires a contract update. Submitting will notify your GGX account team to start activation.`;
    case 'contact':
      return `${m.def.name} isn't available for this account type or service area yet. Contact support to discuss options.`;
    default:
      return m.def.description;
  }
}
