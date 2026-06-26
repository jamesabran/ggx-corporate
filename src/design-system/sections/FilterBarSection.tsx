import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { SearchInput } from '../../app/components/SearchInput';
import { Select } from '../../app/components/ui/Select';

const CODE = `import { SearchInput } from '@/app/components/SearchInput';
import { Select } from '@/app/components/ui/Select';

const [search, setSearch] = useState('');
const [status, setStatus] = useState('all');

// Filter bar row
<div className="flex flex-wrap items-center gap-3">
  <div className="flex-1 min-w-[200px] max-w-xs">
    <SearchInput
      placeholder="Search by tracking number…"
      value={search}
      onChange={setSearch}
    />
  </div>
  <Select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="w-[160px]"
  >
    <option value="all">All statuses</option>
    <option value="in_transit">In transit</option>
    <option value="delivered">Delivered</option>
    <option value="failed">Failed</option>
  </Select>
  <p className="text-xs text-gray-500 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
</div>`;

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

const SAMPLE_ROWS = [
  { tracking: 'GGX-2026-00123', recipient: 'Aling Rosa Reyes', status: 'in_transit' },
  { tracking: 'GGX-2026-00124', recipient: 'Berto Castillo', status: 'delivered' },
  { tracking: 'GGX-2026-00125', recipient: 'Carla Mendoza', status: 'failed' },
  { tracking: 'GGX-2026-00126', recipient: 'Dante Villanueva', status: 'delivered' },
  { tracking: 'GGX-2026-00127', recipient: 'Elena Santos', status: 'in_transit' },
];

export function FilterBarSection() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = SAMPLE_ROWS.filter((r) => {
    const searchOk = !search || r.tracking.toLowerCase().includes(search.toLowerCase()) || r.recipient.toLowerCase().includes(search.toLowerCase());
    const statusOk = status === 'all' || r.status === status;
    return searchOk && statusOk;
  });

  return (
    <Section
      id="filter-bar"
      title="Filter Bar"
      intro="A composed SearchInput + Select pattern used across every list page (Transactions, Claims, SLA Alerts, Address Book). Provides text search and status filter in a single flex row."
    >
      <Subsection title="Live implementation" description="The filter bar and result count are wired to the sample data below.">
        <PreviewBox className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] max-w-xs">
              <SearchInput
                placeholder="Search by tracking number or recipient…"
                value={search}
                onChange={setSearch}
              />
            </div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-[160px]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
            <p className="ml-auto text-xs text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="px-4 py-2.5 font-medium">Tracking</th>
                  <th className="px-4 py-2.5 font-medium">Recipient</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-400">
                      No results match your search or filters.
                    </td>
                  </tr>
                ) : filtered.map((row) => (
                  <tr key={row.tracking} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.tracking}</td>
                    <td className="px-4 py-3 text-gray-700">{row.recipient}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        row.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Wrap SearchInput in flex-1 min-w-[200px] max-w-xs so it scales but caps on wide screens.',
            'Put result count (text-xs text-gray-500) at the far right with ml-auto.',
            'Combine with the Empty State pattern for the zero-result table row.',
            'Add more Select filters in the same row for multi-dimensional filtering.',
          ]}
          donts={[
            "Don't re-fetch from the server on every keystroke — filter the local data array.",
            "Don't omit the result count when the list can be filtered — users need orientation feedback.",
            "Don't place the filter bar inside the table header — keep it above the Card.",
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'SearchInput has a built-in label via its placeholder; pair with an aria-label if the placeholder is not descriptive enough.',
          'Select has a visible SelectValue — ensure the placeholder "All statuses" is present before a value is chosen.',
          'Result count is passive text; no live region needed for local filtering.',
        ]}
      />
    </Section>
  );
}
