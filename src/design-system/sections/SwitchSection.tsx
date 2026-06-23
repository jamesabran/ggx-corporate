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
import { Switch } from '../../app/components/ui/Switch';

const CODE = `import { Switch } from '@/app/components/ui/Switch';

const [on, setOn] = useState(true);

<Switch checked={on} onCheckedChange={setOn} aria-label="Delivery status updates" />`;

export function SwitchSection() {
  const [on, setOn] = useState(true);

  return (
    <Section
      id="switch"
      title="Switch"
      intro="A binary on/off toggle for instantly-applied settings. Extracted from the inline pattern in Settings → notification preferences and now shared."
    >
      <ImplementationMeta id="switch" note="Controlled via checked + onCheckedChange. Use for settings that apply immediately, not for form submit values." />

      <Subsection title="States" description="On, off, and disabled.">
        <PreviewBox className="flex items-center gap-8">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            Interactive <Switch checked={on} onCheckedChange={setOn} aria-label="Demo toggle" />
          </label>
          <Switch checked onCheckedChange={() => {}} aria-label="On" />
          <Switch checked={false} onCheckedChange={() => {}} aria-label="Off" />
          <Switch checked disabled onCheckedChange={() => {}} aria-label="Disabled on" />
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders role="switch" with aria-checked reflecting state.',
          'Always pass aria-label or aria-labelledby so the control is named.',
          'Keyboard: focusable, Enter/Space toggles; focus shows the primary ring.',
          'Disabled uses the native disabled attribute (skipped in the tab order).',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for instant on/off settings.', 'Label the switch (visible text or aria-label).', 'Reflect the saved state immediately.']}
          donts={['Don’t use for actions that need a separate Save — use a Checkbox.', 'Don’t use unlabeled switches.', 'Don’t use for mutually exclusive choices — use Radio/Segmented Control.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
