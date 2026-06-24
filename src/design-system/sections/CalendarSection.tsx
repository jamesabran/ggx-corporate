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
import { Calendar } from '../../app/components/ui/Calendar';

const CODE = `import { Calendar } from '@/app/components/ui/Calendar';

const [date, setDate] = useState<Date | null>(null);

<Calendar value={date} onChange={setDate} />`;

export function CalendarSection() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <Section
      id="calendar"
      title="Calendar"
      intro="A single-date month picker with no date library. Navigate months and pick a day; the caller owns the selected value (e.g. for pickup scheduling)."
    >
      <ImplementationMeta
        id="calendar"
        note="In progress: new shared component. Today is highlighted; the selected day is filled. Pair with a Popover + input for a date-field."
      />

      <Subsection title="Live implementation">
        <PreviewBox className="flex flex-wrap items-start gap-6">
          <Calendar value={date} onChange={setDate} />
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium text-gray-900">{date ? date.toLocaleDateString() : 'none'}</span>
          </p>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for picking a single date (e.g. pickup day).', 'Default the view to a relevant month.', 'Pair with a Popover for a compact date-field.']}
          donts={['Don’t use for ranges yet (single date only).', 'Don’t rely on color alone to mark today vs selected.', 'Don’t block keyboard date entry where typing is faster.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Month navigation buttons have aria-labels; day cells are buttons with aria-pressed for the selection.',
          'Today is visually distinct from the selected day so both are clear.',
          'For a typed date, pair it with an input so keyboard users can enter a date directly.',
        ]}
      />


    </Section>
  );
}
