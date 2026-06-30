import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section, SpecTable } from '../../components/DocPrimitives';
import { COMPONENT_META } from '../../data/componentRegistry';
import { cn } from '../../../app/lib/utils';

const CATEGORIES: { label: string; paths: string[]; description: string }[] = [
  {
    label: 'Display',
    paths: ['alert', 'avatar', 'badge', 'icon-container', 'progress', 'separator', 'tooltip'],
    description: 'Non-interactive elements that communicate status, identity, or structure.',
  },
  {
    label: 'Actions',
    paths: ['button'],
    description: 'Interactive controls that trigger operations.',
  },
  {
    label: 'Inputs',
    paths: ['calendar', 'checkbox', 'combobox', 'field', 'input', 'radio-group', 'search-input', 'segmented-control', 'select', 'switch', 'textarea'],
    description: 'Form controls for capturing user input.',
  },
  {
    label: 'Structure',
    paths: ['accordion', 'breadcrumb', 'card', 'page-header', 'pagination', 'scroll-area', 'tabs'],
    description: 'Layout and navigation building blocks.',
  },
  {
    label: 'Overlays',
    paths: ['dialog', 'otp-dialog', 'popover'],
    description: 'Floating and modal layers.',
  },
  {
    label: 'Data',
    paths: ['table'],
    description: 'Structured data display.',
  },
  {
    label: 'GGX Components',
    paths: ['access-denied', 'address-display-card', 'checkout-delivery-options', 'delivery-status-badge', 'empty-state', 'enablement-gate', 'filter-bar', 'location-cascade', 'module-card', 'stat-card'],
    description: 'GGX-specific compositions built on top of the primitive library.',
  },
];

const STATUS_COLORS: Record<string, string> = {
  'in-use':      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  deprecated:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};
const STATUS_LABELS: Record<string, string> = {
  'in-use': 'In use', 'in-progress': 'In progress', deprecated: 'Deprecated',
};

export function ComponentsOverviewPage() {
  const allMeta = Object.values(COMPONENT_META);
  const inUse = allMeta.filter((m) => m.status === 'in-use').length;
  const inProgress = allMeta.filter((m) => m.status === 'in-progress').length;

  return (
    <DSPage title="Components Overview">
      <Section
        id="components-overview"
        title="Components"
        intro="All shared and GGX-specific components. Live previews are rendered from the production source — no mocks."
      >
        <div className="flex gap-4 text-sm">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            {inUse} in use
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            {inProgress} in progress
          </span>
        </div>

        <div className="space-y-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{cat.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{cat.description}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.paths.map((id) => {
                  const meta = COMPONENT_META[id];
                  if (!meta) return null;
                  const href = id.startsWith('otp-dialog') || cat.label === 'GGX Components'
                    ? `/design-system/ggx-components/${id}`
                    : `/design-system/components/${id}`;
                  const ggxPaths = ['access-denied','address-display-card','checkout-delivery-options','delivery-status-badge','empty-state','enablement-gate','filter-bar','location-cascade','module-card','otp-dialog','stat-card'];
                  const resolvedHref = ggxPaths.includes(id)
                    ? `/design-system/ggx-components/${id}`
                    : `/design-system/components/${id}`;

                  return (
                    <Link
                      key={id}
                      to={resolvedHref}
                      className="group flex flex-col gap-1 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-[#0088C9] dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors">
                          {meta.title}
                        </span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[meta.status])}>
                          {STATUS_LABELS[meta.status]}
                        </span>
                      </div>
                      {meta.blurb && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{meta.blurb}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="status-legend" title="Status legend">
        <SpecTable
          columns={['Status', 'Meaning']}
          rows={[
            [<span key="iu" className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">In use</span>, 'Shipped in the production app. Stable API.'],
            [<span key="ip" className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">In progress</span>, 'Exported and documented but still rolling out to app screens.'],
            [<span key="d" className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">Deprecated</span>, 'Do not use in new work. Being phased out.'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
