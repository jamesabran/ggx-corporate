import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconCircleCheck, IconClockHour4, IconLoader2 } from '@tabler/icons-react';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ModuleCard } from '../components/ModuleCard';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import {
  getModuleCatalog, resolveAddonAccountId,
  type ModuleCategory,
  type ResolvedModule,
} from '../services/businessModulesService';
import { enableAddon, requestAddon } from '../services/addonsService';

interface ActivationOutcome {
  kind: 'enabled' | 'requested';
  title: string;
  message: string;
  route?: string;
}

type Phase = 'confirm' | 'submitting' | 'done';

/**
 * Account Add-ons — the discovery surface for OPTIONAL account capabilities.
 * Status + CTA are resolved by businessModulesService.
 *
 * Self-enable add-ons (Inventory/Storefront/On-Demand) call enableAddon directly.
 * Contract/approval add-ons call requestAddon which submits a request and pushes
 * a Notification — approval flows from the Notifications page.
 */
export function AccountAddOns() {
  const ctx = useModuleAccessContext();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<{ category: ModuleCategory; label: string; modules: ResolvedModule[] }[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'available' | 'locked'>('all');

  const [actioned, setActioned] = useState<ResolvedModule | null>(null);
  const [phase, setPhase] = useState<Phase>('confirm');
  const [outcome, setOutcome] = useState<ActivationOutcome | null>(null);

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
    const { def, cta } = actioned;
    const accountId = resolveAddonAccountId(actioned.def, ctx);
    await new Promise((r) => setTimeout(r, 600));
    let result: ActivationOutcome;
    if (cta.kind === 'enable') {
      enableAddon(def.id, accountId);
      result = {
        kind: 'enabled',
        title: `${def.name} enabled`,
        message: `${def.name} is now enabled for this account and ready to use.`,
        route: def.route,
      };
    } else {
      requestAddon(def.id, accountId);
      result = {
        kind: 'requested',
        title: 'Request submitted',
        message: `Your request for ${def.name} has been submitted. Your GGX account team will review it — check Notifications for updates and to confirm activation.`,
      };
    }
    setOutcome(result);
    setPhase('done');
    reload();
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

    </div>
  );
}

function actionTitle(m: ResolvedModule): string {
  switch (m.cta.kind) {
    case 'enable': return `Enable ${m.def.name}`;
    case 'request_activation': return `Request activation — ${m.def.name}`;
    default: return m.def.name;
  }
}

function actionBody(m: ResolvedModule): string {
  switch (m.cta.kind) {
    case 'enable':
      return `${m.def.name} can be enabled for your account. Confirm to turn it on and start using it right away.`;
    case 'request_activation':
      return `${m.def.name} may require a contract update. Submitting will send a request to your GGX account team — you'll receive a Notification when it's reviewed.`;
    default:
      return m.def.description;
  }
}
