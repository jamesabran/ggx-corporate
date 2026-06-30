import { DSPage } from '../../layout/DSPage';
import { Section, SpecTable } from '../../components/DocPrimitives';
import { COMPONENT_META, GGX_SHADCN_URL } from '../../data/componentRegistry';
import { cn } from '../../../app/lib/utils';
import { IconExternalLink } from '@tabler/icons-react';

const STATUS_COLORS: Record<string, string> = {
  'in-use':      'text-green-700 dark:text-green-400',
  'in-progress': 'text-amber-700 dark:text-amber-400',
  deprecated:    'text-gray-500 dark:text-gray-400',
};
const STATUS_LABELS: Record<string, string> = {
  'in-use': 'In use', 'in-progress': 'In progress', deprecated: 'Deprecated',
};

export function TraceabilityPage() {
  const components = Object.values(COMPONENT_META).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <DSPage title="Traceability">
      <Section
        id="traceability"
        title="Traceability"
        intro="Every documented component mapped to its three sources: Figma (GGX-SHADCN), production code, and documentation. Missing or unverified mappings are shown explicitly — not hidden."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Component</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Figma (GGX-SHADCN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {components.map((meta) => (
                <tr key={meta.id} className="dark:bg-gray-900/20">
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{meta.title}</td>
                  <td className={cn('px-4 py-2.5 text-xs font-medium', STATUS_COLORS[meta.status])}>
                    {STATUS_LABELS[meta.status]}
                  </td>
                  <td className="px-4 py-2.5">
                    <code className="font-mono text-[11px] text-gray-500 dark:text-gray-400 break-all">{meta.source}</code>
                  </td>
                  <td className="px-4 py-2.5">
                    {meta.figma.needsVerification ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {meta.figma.name} · needs verification
                      </span>
                    ) : (
                      <a
                        href={GGX_SHADCN_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-[#0088C9] dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        {meta.figma.name}
                        <IconExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="gaps" title="Known gaps">
        <SpecTable
          columns={['Gap', 'Notes']}
          rows={[
            ['Figma keys marked "needs verification"', 'The component name in GGX-SHADCN is known but the published key could not be confirmed. Verify in Figma before using in Code Connect.'],
            ['Pattern-level Figma frames', 'Booking flows, bulk upload, and transactions patterns don\'t have dedicated Figma frames. They use composition of existing components.'],
            ['Responsive behavior Figma', 'Breakpoint behavior is documented in code but not yet in dedicated Figma frames.'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
