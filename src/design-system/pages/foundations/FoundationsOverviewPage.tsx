import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section } from '../../components/DocPrimitives';

const FOUNDATIONS = [
  {
    label: 'Colors',
    path: '/design-system/foundations/colors',
    description: 'GGX brand palette, semantic color roles, and Tailwind token aliases.',
  },
  {
    label: 'Typography',
    path: '/design-system/foundations/typography',
    description: 'Inter type scale, weight conventions, and heading/body sizing.',
  },
  {
    label: 'Spacing',
    path: '/design-system/foundations/spacing',
    description: 'Tailwind spacing scale as used in GGX layouts and components.',
  },
  {
    label: 'Design Tokens',
    path: '/design-system/foundations/design-tokens',
    description: 'CSS custom properties from tokens.json — the single source of truth for colors, radius, and theme values.',
  },
  {
    label: 'Elevation & Shadows',
    path: '/design-system/foundations/elevation-shadows',
    description: 'Box-shadow values and layering conventions for cards, modals, and popovers.',
  },
  {
    label: 'Icons',
    path: '/design-system/icons',
    description: 'Tabler Icons library as used across GGX — search and copy class names.',
  },
  {
    label: 'Responsive behavior',
    path: '/design-system/foundations/responsive-behavior',
    description: 'Breakpoint system, layout patterns, and mobile-first conventions.',
  },
];

export function FoundationsOverviewPage() {
  return (
    <DSPage title="Foundations Overview">
      <Section
        id="foundations-overview"
        title="Foundations"
        intro="The visual primitives that all GGX components and layouts are built on. Every token and value here is sourced from the codebase — nothing is invented for this reference."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDATIONS.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              className="group rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0088C9] dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors">
                {f.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{f.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </DSPage>
  );
}
