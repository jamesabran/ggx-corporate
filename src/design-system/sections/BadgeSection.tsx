import {
  Section,
  Subsection,
  PreviewBox,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';
import { DELIVERY_STATUSES, DELIVERY_STATUS_ORDER } from '../data/deliveryStatus';

const CODE = `import { DeliveryStatusBadge } from '@/design-system/components/DeliveryStatusBadge';

<DeliveryStatusBadge status="in_transit" />
<DeliveryStatusBadge status="awaiting_payment" size="sm" />
<DeliveryStatusBadge status="delivered" withIcon={false} />`;

export function BadgeSection() {
  return (
    <Section
      id="delivery-status-badge"
      title="Delivery Status Badge"
      intro="A compact, semantic badge for a delivery's current status. Used once per row in transaction lists and in the header of a transaction's detail view."
    >
      <ImplementationMeta
        id="delivery-status-badge"
        note={
          <>
            Maps each status to a <strong>variant</strong> of the production <code className="font-mono">Badge</code>{' '}
            (<code className="font-mono">src/app/components/ui/Badge.tsx</code>), the canonical component used in the live
            Transactions list — it does not recreate badge visuals. Color comes from the Badge semantic palette; the icon
            and label distinguish statuses that share a family (e.g. For Pickup and In Transit are both{' '}
            <code className="font-mono">info</code>).
          </>
        }
      />

      <Subsection title="Live implementation" description="Each badge below renders the production Badge component.">
        <ResponsivePreview>
          <div className="flex flex-wrap items-center gap-3">
            {DELIVERY_STATUS_ORDER.map((key) => (
              <DeliveryStatusBadge key={key} status={key} />
            ))}
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Sizes & options" description="The supported props are status, size ('sm' | 'md'), and withIcon. Nothing else.">
        <PreviewBox className="flex flex-wrap items-center gap-3">
          <DeliveryStatusBadge status="in_transit" size="md" />
          <DeliveryStatusBadge status="in_transit" size="sm" />
          <DeliveryStatusBadge status="in_transit" withIcon={false} />
        </PreviewBox>
      </Subsection>

      <Subsection title="Semantic meaning">
        <SpecTable
          columns={['Status', 'Badge variant', 'Meaning']}
          rows={DELIVERY_STATUS_ORDER.map((key) => {
            const d = DELIVERY_STATUSES[key];
            return [
              <DeliveryStatusBadge key={key} status={key} size="sm" />,
              <code key={`${key}-v`} className="font-mono text-xs">{d.variant}</code>,
              d.meaning,
            ];
          })}
        />
      </Subsection>

      <Subsection title="In a transaction list" description="One badge per row, right-aligned, so status scans down the column.">
        <PreviewBox className="space-y-0 divide-y divide-gray-100 !p-0">
          {[
            { id: 'GGX-2026-10231', name: 'Acme Luzon', status: 'in_transit' as const },
            { id: 'GGX-2026-10232', name: 'Bright Retail', status: 'awaiting_payment' as const },
            { id: 'GGX-2026-10233', name: 'Northwind Co.', status: 'needs_review' as const },
            { id: 'GGX-2026-10234', name: 'Sunrise Mart', status: 'delivered' as const },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-mono text-xs text-gray-500">{row.id}</p>
                <p className="text-sm font-medium text-gray-900">{row.name}</p>
              </div>
              <DeliveryStatusBadge status={row.status} size="sm" />
            </div>
          ))}
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Status is conveyed by the text label, not color alone — readable for color-blind users.',
          'The leading icon is decorative; the label carries the meaning.',
          'Non-interactive by design (no focus or keyboard handling) — it is a status indicator, not a control.',
          'Keep contrast intact by using the defined variant rather than custom colors.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use the fixed status label and color exactly as defined.',
            'Show one badge per transaction, in the status column or detail header.',
            'Keep the badge compact so rows stay readable.',
          ]}
          donts={[
            'Don’t invent statuses or rename them per screen.',
            'Don’t use a vague "Completed" — say "Delivered".',
            'Don’t stack multiple badges to express one status.',
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
