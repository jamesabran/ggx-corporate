import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Combobox } from '../../app/components/ui/Combobox';

const PROVINCES = [
  'Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Bulacan', 'Pampanga',
  'Cebu', 'Davao del Sur', 'Iloilo', 'Negros Occidental', 'Pangasinan',
].map((p) => ({ value: p, label: p }));

const CODE = `import { Combobox } from '@/app/components/ui/Combobox';

const [province, setProvince] = useState('');

<Combobox
  value={province}
  onChange={setProvince}
  options={provinces}
  placeholder="Select province"
  searchPlaceholder="Search provinces…"
/>`;

export function ComboboxSection() {
  const [province, setProvince] = useState('');

  return (
    <Section
      id="combobox"
      title="Combobox"
      intro="A searchable single-select for longer option lists. The trigger shows the current value; opening reveals a filter field over the options."
    >
      <ImplementationMeta
        id="combobox"
        note="In progress: new shared component for long option sets (e.g. provinces, banks). For short, known lists use Select instead."
      />

      <Subsection title="Live implementation" description="Open and type to filter.">
        <PreviewBox className="max-w-xs">
          <Combobox
            value={province}
            onChange={setProvince}
            options={PROVINCES}
            placeholder="Select province"
            searchPlaceholder="Search provinces…"
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use when the list is long enough to need search.', 'Keep option labels concise and scannable.', 'Show the selected value in the trigger.']}
          donts={['Don’t use for 2–5 options — use Select.', 'Don’t use for multi-select.', 'Don’t hide what is being searched.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The trigger is a button with aria-haspopup="listbox" / aria-expanded; options use role="option" with aria-selected.',
          'The filter field autofocuses on open; Escape and outside click close the panel.',
          'An empty result shows a clear "No matches" message.',
          'For a small set without search, prefer the native Select for full platform a11y.',
        ]}
      />


    </Section>
  );
}
