import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, SpecTable, PreviewBox } from '../../components/DocPrimitives';
function LoadingRowsSkeleton() {
  return (
    <div className="space-y-2" aria-busy aria-label="Loading">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Unable to load deliveries</p>
      <p className="mt-1 text-sm text-red-600/80 dark:text-red-500">There was a problem connecting to the server. Check your connection and try again.</p>
      <button type="button" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">
        Retry
      </button>
    </div>
  );
}

export function EmptyLoadingErrorPage() {
  return (
    <DSPage title="Empty, loading & error states">
      <Section
        id="empty-states"
        title="Empty states"
        intro="Use the Empty State component whenever a list, table, or content area has no data to show. Include a heading, supporting text, and a relevant CTA when applicable."
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          See the{' '}
          <Link to="/design-system/ggx-components/empty-state" className="text-[#0088C9] hover:underline dark:text-blue-400">
            Empty State component
          </Link>{' '}
          for live previews and implementation details.
        </p>
        <SpecTable
          columns={['Context', 'Heading pattern', 'CTA?']}
          rows={[
            ['Empty list (no records yet)', '"No [things] yet"', 'Yes — guide the user to create one'],
            ['Empty list (filter returns nothing)', '"No results for "[query]""', 'Yes — "Clear filters"'],
            ['Feature not enabled', 'Use Enablement Gate instead', 'Enable CTA via Enablement Gate'],
            ['Permission denied', 'Use Access Denied component', 'No CTA (contact admin)'],
          ]}
        />
      </Section>

      <Section id="loading-states" title="Loading states">
        <Subsection title="Skeleton loaders">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use skeleton placeholders (animated gray blocks) that match the approximate shape of the
            incoming content. This reduces layout shift and communicates that content is coming — not missing.
          </p>
          <PreviewBox>
            <LoadingRowsSkeleton />
          </PreviewBox>
        </Subsection>
        <Subsection title="Spinner">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use a centered spinner only for full-page loads or when a skeleton shape is impractical
            (e.g., async data inside a modal). Prefer skeletons for list/table areas.
          </p>
        </Subsection>
        <SpecTable
          columns={['Pattern', 'When to use']}
          rows={[
            ['Skeleton', 'Lists, tables, cards — anything with a predictable shape'],
            ['Spinner', 'Full-page lazy routes, async modal content, form submit in-progress'],
            ['Disabled button + spinner', 'Form submit — replace button label with a spinner, disable the button'],
            ['Optimistic UI', 'Toggle actions (e.g., switch) where failure is rare — revert on error'],
          ]}
        />
      </Section>

      <Section id="error-states" title="Error states">
        <Subsection title="Inline fetch error">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            When a data-fetch fails, replace the loading skeleton with an error state that includes the
            problem and a retry action. Do not leave a blank area.
          </p>
          <PreviewBox>
            <ErrorState />
          </PreviewBox>
        </Subsection>
        <Subsection title="Alert for operation errors">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the{' '}
            <Link to="/design-system/components/alert" className="text-[#0088C9] hover:underline dark:text-blue-400">Alert</Link>{' '}
            component (<code className="font-mono text-xs">variant="destructive"</code>) at the top of a
            form or page when a submit/save operation fails. Do not use toasts for form errors.
          </p>
        </Subsection>
        <SpecTable
          columns={['Error type', 'Pattern']}
          rows={[
            ['Data-fetch failure', 'Inline error state with Retry CTA'],
            ['Form submit failure', 'Alert (destructive) above the form'],
            ['Validation failure', 'Field-level error messages (see Forms & validation)'],
            ['Page not found', 'Full-page 404 state with link back to dashboard'],
            ['Permission denied', 'Access Denied component'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
