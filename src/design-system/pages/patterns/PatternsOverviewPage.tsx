import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section } from '../../components/DocPrimitives';

const PATTERNS = [
  {
    label: 'Booking flows',
    path: '/design-system/patterns/booking-flows',
    description: 'Bulk booking via CSV/spreadsheet upload and manual entry — sender/receiver selection, service-type choice, and confirmation.',
  },
  {
    label: 'Bulk upload',
    path: '/design-system/patterns/bulk-upload',
    description: 'Multi-step upload flow: file selection, row validation, error review, summary, and payment.',
  },
  {
    label: 'Transactions & tracking',
    path: '/design-system/patterns/transactions-tracking',
    description: 'Transaction list with tabs, filters, pagination, and per-row tracking status.',
  },
  {
    label: 'Forms & validation',
    path: '/design-system/patterns/forms-validation',
    description: 'Field grouping, label/helper/error layout, required indicators, and inline vs. submit validation.',
  },
  {
    label: 'Empty, loading & error',
    path: '/design-system/patterns/empty-loading-error',
    description: 'Standard states for lists, tables, and content areas when data is absent, loading, or failed.',
  },
];

export function PatternsOverviewPage() {
  return (
    <DSPage title="Patterns Overview">
      <Section
        id="patterns-overview"
        title="Patterns"
        intro="Recurring multi-component compositions that solve specific GGX Corporate workflows. Patterns document how components work together — not as new constraints, but as documented precedent."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {PATTERNS.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              className="group rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0088C9] dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors">
                {p.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="about-patterns" title="About patterns">
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Patterns describe how multiple components are assembled to handle a specific workflow. They
            don't prescribe exact pixel layout — they capture the decision that was made, so future
            work stays consistent without repeating the same design work.
          </p>
          <p>
            Each pattern page links to the relevant component pages and shows the composition in context.
            Where a pattern has a live coded component (e.g., CheckoutDeliveryOptions), the pattern
            page links to it. Where the pattern is a convention across multiple screens, it's described
            with examples and constraints.
          </p>
        </div>
      </Section>
    </DSPage>
  );
}
