import { useEffect, useMemo, useState } from 'react';
import { IconApps } from '@tabler/icons-react';
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

/**
 * Business Modules — the discovery surface for GGX Business+ offerings. Shows all
 * modules in a controlled way (the full platform direction stays visible), with a
 * status-aware CTA per module resolved by businessModulesService.
 *
 * Activation/request CTAs are acknowledged via a mock dialog — there is no real
 * activation backend yet. Routed CTAs (Open / Set up / Continue setup /
 * dependency) navigate to the relevant page.
 */
export function BusinessModules() {
  const ctx = useModuleAccessContext();
  const [groups, setGroups] = useState<{ category: ModuleCategory; label: string; modules: ResolvedModule[] }[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'available' | 'locked'>('all');
  const [actioned, setActioned] = useState<ResolvedModule | null>(null);

  useEffect(() => {
    let active = true;
    getModuleCatalog(ctx).then((g) => { if (active) setGroups(g); });
    return () => { active = false; };
  }, [ctx]);

  const filteredGroups = useMemo(() => {
    if (filter === 'all') return groups;
    const match = (m: ResolvedModule) => {
      if (filter === 'active') return m.status === 'enabled' || m.status === 'requires_setup' || m.status === 'included';
      if (filter === 'available') return m.status === 'available_to_activate';
      // locked
      return ['requires_approval', 'requires_contract_revision', 'requires_dependency', 'not_available', 'coming_soon'].includes(m.status);
    };
    return groups
      .map((g) => ({ ...g, modules: g.modules.filter(match) }))
      .filter((g) => g.modules.length > 0);
  }, [groups, filter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <IconApps className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Business Modules</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Add tools to GGX Business+ based on your contract, operations, and business needs.
              Some modules can be enabled instantly, while others may require approval or contract updates.
            </p>
          </div>
        </div>
        <div className="w-44">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All modules</option>
            <option value="active">Active &amp; included</option>
            <option value="available">Available to enable</option>
            <option value="locked">Locked &amp; upcoming</option>
          </Select>
        </div>
      </div>

      {filteredGroups.map((group) => (
        <section key={group.category}>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{group.label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.modules.map((m) => (
              <ModuleCard key={m.def.id} module={m} onAction={setActioned} />
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-12">No modules match this filter.</p>
      )}

      <Dialog
        open={!!actioned}
        onClose={() => setActioned(null)}
        title={actioned ? actionTitle(actioned) : ''}
        size="sm"
      >
        {actioned && (
          <>
            <p className="text-sm text-gray-600">{actionBody(actioned)}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActioned(null)}>Close</Button>
              <Button onClick={() => setActioned(null)}>{actioned.cta.label}</Button>
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
    case 'request_approval': return `Request ${m.def.name}`;
    case 'request_activation': return `Request activation — ${m.def.name}`;
    case 'contact': return `Contact support — ${m.def.name}`;
    default: return m.def.name;
  }
}

function actionBody(m: ResolvedModule): string {
  switch (m.cta.kind) {
    case 'enable':
      return `${m.def.name} can be enabled for your account. Confirm to turn it on and add it to your workspace.`;
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
