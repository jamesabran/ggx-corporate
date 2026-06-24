import { useState } from 'react';
import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { SearchInput } from '../../app/components/SearchInput';

const CODE = `import { SearchInput } from '@/app/components/SearchInput';

const [query, setQuery] = useState('');

<SearchInput value={query} onChange={setQuery} placeholder="Search transactions…" />`;

export function SearchInputSection() {
  const [a, setA] = useState('');
  const [b, setB] = useState('GGX-2026-10231');

  return (
    <Section
      id="search-input"
      title="Search Input"
      intro="A controlled text search with a leading magnifier and an inline clear (×) that appears once there's a value. Used in the topbar and list filters."
    >
      <ImplementationMeta id="search-input" note="Controlled: pass value + onChange(value). The clear button shows only when value is non-empty." />

      <Subsection title="Live implementation — empty & filled" description="Type to see the clear button appear; click × to clear.">
        <ResponsivePreview>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Empty</p>
              <SearchInput value={a} onChange={setA} placeholder="Search transactions…" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Filled (clearable)</p>
              <SearchInput value={b} onChange={setB} placeholder="Search transactions…" />
            </div>
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for filtering lists and the global topbar search.', 'Keep placeholder text specific ("Search transactions…").', 'Debounce expensive queries upstream if needed.']}
          donts={['Don’t use as a generic text field — use Input.', 'Don’t hide what is being searched.', 'Don’t remove the clear affordance.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The clear button has an aria-label ("Clear search") and is keyboard-reachable.',
          'The magnifier icon is decorative (pointer-events-none).',
          'Pair with a visible or visually-hidden label when the context isn’t obvious.',
          'Focus shows the standard primary ring.',
        ]}
      />


    </Section>
  );
}
