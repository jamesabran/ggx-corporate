import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section } from '../../components/DocPrimitives';

const RESOURCES = [
  {
    label: 'Traceability',
    path: '/design-system/resources/traceability',
    description: 'Full component matrix connecting Figma, production code, and documentation. Flags missing or unverified mappings.',
  },
  {
    label: 'Changelog',
    path: '/design-system/resources/changelog',
    description: 'History of significant additions, restructures, and documentation changes.',
  },
  {
    label: 'Contributing',
    path: '/design-system/resources/contributing',
    description: 'How to add components, patterns, or pages — Figma first, then implementation, then documentation.',
  },
  {
    label: 'Documentation standards',
    path: '/design-system/resources/documentation-standards',
    description: 'Required page sections, naming conventions, status labels, and what counts as a complete page.',
  },
];

export function ResourcesOverviewPage() {
  return (
    <DSPage title="Resources Overview">
      <Section
        id="resources-overview"
        title="Resources"
        intro="Supporting materials for maintaining and contributing to the GoGo Xpress Design System."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <Link
              key={r.path}
              to={r.path}
              className="group rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0088C9] dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors">
                {r.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </DSPage>
  );
}
