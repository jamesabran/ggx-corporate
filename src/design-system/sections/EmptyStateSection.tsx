import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Card, CardContent } from '../../app/components/ui/Card';
import { Button } from '../../app/components/ui/Button';
import { IconPackages, IconFileSearch, IconAlertCircle } from '@tabler/icons-react';

const CODE = `// Card-level empty state (most common)
<Card>
  <CardContent className="py-12 text-center">
    <IconPackages className="w-10 h-10 text-gray-300 mx-auto mb-3" />
    <p className="text-sm font-semibold text-gray-700">No batches found</p>
    <p className="text-xs text-gray-400 mt-1">
      Upload transactions via Bulk Upload to create batches.
    </p>
  </CardContent>
</Card>

// With CTA
<Card>
  <CardContent className="py-12 text-center">
    <IconPackages className="w-10 h-10 text-gray-300 mx-auto mb-3" />
    <p className="text-sm font-semibold text-gray-700">No transactions yet</p>
    <p className="text-xs text-gray-400 mt-1 mb-4">
      Start by uploading a batch or booking manually.
    </p>
    <Button size="sm">Upload transactions</Button>
  </CardContent>
</Card>

// Inline table-row empty state (search/filter result)
<TableRow>
  <TableCell colSpan={8} className="text-center py-8 text-gray-400 text-sm">
    No transactions match your search or filters.
  </TableCell>
</TableRow>`;

export function EmptyStateSection() {
  const [show, setShow] = useState<'default' | 'cta' | 'filtered'>('default');

  return (
    <Section
      id="empty-state"
      title="Empty State"
      intro="A consistent pattern for zero-data states — card-level (no data at all) or inline table row (filtered search returns nothing). Uses a Tabler icon + heading + optional subtext + optional CTA."
    >
      <Subsection title="Live implementation" description="Three variants used across list pages.">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" variant={show === 'default' ? 'default' : 'outline'} onClick={() => setShow('default')}>No data</Button>
          <Button size="sm" variant={show === 'cta' ? 'default' : 'outline'} onClick={() => setShow('cta')}>No data + CTA</Button>
          <Button size="sm" variant={show === 'filtered' ? 'default' : 'outline'} onClick={() => setShow('filtered')}>Filtered (no match)</Button>
        </div>
        <PreviewBox>
          {show === 'default' && (
            <Card>
              <CardContent className="py-12 text-center">
                <IconPackages className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No batches found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload transactions via Bulk Upload to create batches.
                </p>
              </CardContent>
            </Card>
          )}
          {show === 'cta' && (
            <Card>
              <CardContent className="py-12 text-center">
                <IconFileSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Start by uploading a batch or booking manually.
                </p>
                <Button size="sm">Upload transactions</Button>
              </CardContent>
            </Card>
          )}
          {show === 'filtered' && (
            <Card>
              <CardContent className="py-8 text-center">
                <IconAlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No transactions match your search or filters.</p>
              </CardContent>
            </Card>
          )}
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use py-12 text-center inside CardContent for the card-level variant.',
            'Icon size w-10 h-10 text-gray-300 for card-level; w-8 h-8 for table/inline.',
            'Keep heading short (≤ 5 words); subtext adds context or next action.',
            'Add a CTA button only when there is a clear first action to take.',
          ]}
          donts={[
            "Don't leave a page blank — always show an empty state instead of nothing.",
            "Don't show a CTA for read-only or scoped views where the user can't create data.",
            "Don't use the icon-heavy card variant inside a table row — use the inline text row instead.",
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The text message is the meaningful content — the icon is decorative (no alt needed).',
          'Empty state cards are not interactive unless a CTA is present.',
        ]}
      />
    </Section>
  );
}
