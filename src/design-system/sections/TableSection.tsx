import {
  Section,
  Subsection,
  PreviewBox,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../app/components/ui/Table';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';

const CODE = `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Tracking</TableHead>
      <TableHead>Recipient</TableHead>
      <TableHead className="text-right">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>GGX-2026-10231</TableCell>
      <TableCell>Acme Luzon</TableCell>
      <TableCell className="text-right">…</TableCell>
    </TableRow>
  </TableBody>
</Table>`;

const ROWS = [
  { id: 'GGX-2026-10231', name: 'Acme Luzon', status: 'in_transit' as const },
  { id: 'GGX-2026-10232', name: 'Bright Retail', status: 'awaiting_payment' as const },
  { id: 'GGX-2026-10233', name: 'Northwind Co.', status: 'needs_review' as const },
  { id: 'GGX-2026-10234', name: 'Sunrise Mart', status: 'delivered' as const },
];

export function TableSection() {
  return (
    <Section
      id="table"
      title="Table"
      intro="Composable table parts for data lists — header, body, rows, head and data cells — with hover row highlighting and a horizontal scroll wrapper for narrow screens."
    >
      <ImplementationMeta id="table" note="Compose the parts; cells accept any content (badges, buttons). The wrapper scrolls horizontally on small screens." />

      <Subsection title="Live implementation" description="Rows compose other DS components (here, the Delivery Status Badge). Switch to Mobile to see horizontal scroll.">
        <ResponsivePreview>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{r.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                  <TableCell className="text-right"><DeliveryStatusBadge status={r.status} size="sm" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Empty state" description="Render a single full-width cell when there are no rows.">
        <PreviewBox>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-gray-500">No transactions match your filters.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use real <th> headers for every column.', 'Compose badges/buttons inside cells.', 'Provide an explicit empty state.']}
          donts={['Don’t fake a table with divs.', 'Don’t cram too many columns on mobile — prioritize.', 'Don’t remove the hover affordance on interactive rows.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders semantic <table>/<thead>/<tbody>/<th>/<td>, so screen readers announce rows and headers.',
          'Use <TableHead> (<th>) for column headers, not styled cells.',
          'Right-align numeric/status columns with text-right for scannability.',
          'The scroll wrapper keeps wide tables usable on mobile without breaking layout.',
        ]}
      />


    </Section>
  );
}
