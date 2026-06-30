import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, SpecTable } from '../../components/DocPrimitives';

export function TransactionsTrackingPage() {
  return (
    <DSPage title="Transactions & tracking">
      <Section
        id="transactions"
        title="Transactions & tracking"
        intro="The Transactions screen is the primary operational view in GGX Business+ — a filterable, paginated table of all deliveries across Deliveries and Store Orders tabs."
      >
        <Subsection title="Page structure">
          <SpecTable
            columns={['Region', 'Component / element']}
            rows={[
              ['Page header', 'PageHeader with title "Transactions" and optional date-range actions'],
              ['Tab switcher', 'Tabs — "Deliveries" and "Store Orders" (Store Orders shown when Storefront is active)'],
              ['Filter bar', 'FilterBar — search input, status select, date range, subaccount select'],
              ['Table', 'Table — sortable columns, Delivery Status Badge per row, row click to detail'],
              ['Pagination', 'Pagination — list summary + Previous/Next at the bottom'],
            ]}
          />
        </Subsection>

        <Subsection title="Delivery Status Badge">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Every row shows a{' '}
            <Link to="/design-system/ggx-components/delivery-status-badge" className="text-[#0088C9] hover:underline dark:text-blue-400">
              Delivery Status Badge
            </Link>{' '}
            mapping the raw API status string to a visual variant. The mapping lives in{' '}
            <code className="font-mono text-xs">src/design-system/data/deliveryStatus.ts</code>.
          </p>
        </Subsection>
      </Section>

      <Section id="tracking" title="Tracking">
        <Subsection title="Public tracking page">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <code className="font-mono text-xs">/track/:trackingNumber</code> is a public, unauthenticated page.
            It shows a minimal status timeline without the dashboard shell. No auth guard.
          </p>
        </Subsection>
        <Subsection title="In-dashboard detail">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <code className="font-mono text-xs">/dashboard/transactions/:id</code> shows the full delivery detail
            for authenticated Corporate users — timeline, addresses, waybill, and actions (e.g., file a claim).
          </p>
        </Subsection>
      </Section>

      <Section id="filter-bar-pattern" title="Filter bar pattern">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The Filter Bar is a horizontal strip of controls above the Table. It applies
          server-side filters — never client-side. See the{' '}
          <Link to="/design-system/ggx-components/filter-bar" className="text-[#0088C9] hover:underline dark:text-blue-400">
            Filter Bar component
          </Link>{' '}
          for implementation details.
        </p>
        <SpecTable
          columns={['Control', 'Type', 'Notes']}
          rows={[
            ['Search', 'SearchInput', 'Debounced, triggers server query on change'],
            ['Status', 'Select', 'Maps to API status values from deliveryStatus.ts'],
            ['Date range', 'Two Calendar inputs', 'From / To; clears together'],
            ['Subaccount', 'Select', 'Shown only in Main Account view; hidden in Subaccount view'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
