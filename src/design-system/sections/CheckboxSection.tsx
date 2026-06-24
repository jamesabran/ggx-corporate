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
import { Checkbox } from '../../app/components/ui/Checkbox';

const CODE = `import { Checkbox } from '@/app/components/ui/Checkbox';

<label className="flex items-center gap-2 text-sm text-gray-700">
  <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
  Remember me
</label>`;

export function CheckboxSection() {
  const [agree, setAgree] = useState(true);

  return (
    <Section
      id="checkbox"
      title="Checkbox"
      intro="A native checkbox for boolean opt-ins and multi-select lists. Extracted from the inline pattern used in Login and forms."
    >
      <ImplementationMeta id="checkbox" note="Renders a real <input type='checkbox'> — pair with a <label> for a clickable hit area." />

      <Subsection title="States" description="Unchecked, checked, and disabled.">
        <PreviewBox className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Remember me (interactive)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox defaultChecked /> Subscribed
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <Checkbox disabled /> Disabled
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <Checkbox disabled defaultChecked /> Disabled checked
          </label>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for opt-ins and multi-select lists.', 'Always pair with a label.', 'Group related checkboxes under a heading.']}
          donts={['Don’t use for instantly-applied settings — use Switch.', 'Don’t use for one-of-many — use Radio.', 'Don’t leave a checkbox unlabeled.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Uses a native checkbox: keyboard toggling (Space), form participation, and indeterminate support come for free.',
          'Wrap with a <label> (or use htmlFor/id) so the text is a clickable target.',
          'Focus shows the standard ring; disabled uses the native attribute.',
        ]}
      />


    </Section>
  );
}
