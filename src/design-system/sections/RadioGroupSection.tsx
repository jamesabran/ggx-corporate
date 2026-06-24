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
import { RadioGroup } from '../../app/components/ui/RadioGroup';

const CODE = `import { RadioGroup } from '@/app/components/ui/RadioGroup';

const [handoff, setHandoff] = useState('pickup');

<RadioGroup
  name="handoff"
  value={handoff}
  onChange={setHandoff}
  options={[
    { value: 'pickup', label: 'Rider pickup', description: 'A rider collects from your address.' },
    { value: 'dropoff', label: 'Drop-off', description: 'Bring parcels to a branch.' },
  ]}
/>`;

export function RadioGroupSection() {
  const [handoff, setHandoff] = useState('pickup');

  return (
    <Section
      id="radio-group"
      title="Radio Group"
      intro="A single-select group built on native radio inputs — one choice from a small set of mutually exclusive options."
    >
      <ImplementationMeta
        id="radio-group"
        note="In progress: new shared component for one-of-many choices. Uses native radios for keyboard and form semantics."
      />

      <Subsection title="Live implementation">
        <PreviewBox className="max-w-md">
          <RadioGroup
            name="handoff-demo"
            value={handoff}
            onChange={setHandoff}
            options={[
              { value: 'pickup', label: 'Rider pickup', description: 'A rider collects from your address.' },
              { value: 'dropoff', label: 'Drop-off', description: 'Bring parcels to a GGX branch.' },
              { value: 'scheduled', label: 'Scheduled pickup', description: 'Pick a date and time.', disabled: true },
            ]}
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for one-of-many among a small set.', 'Give each option a clear label (and description if helpful).', 'Default to the safest/most common option.']}
          donts={['Don’t use for multi-select — use Checkboxes.', 'Don’t use for instant toggles — use Switch.', 'Don’t use for long option lists — use Select.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Wrapped in role="radiogroup"; each option is a native radio inside a <label> (clickable label + arrow-key navigation).',
          'Shares one name so the browser enforces single-select.',
          'Disabled options use the native attribute and are skipped.',
          'Selected state shows a border + tint, not color alone.',
        ]}
      />


    </Section>
  );
}
