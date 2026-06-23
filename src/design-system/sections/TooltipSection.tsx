import { IconInfoCircle } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Tooltip } from '../../app/components/ui/Tooltip';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { Tooltip } from '@/app/components/ui/Tooltip';
import { IconInfoCircle } from '@tabler/icons-react';

<Tooltip content="Estimated from declared value">
  <button type="button" aria-label="More info">
    <IconInfoCircle className="h-4 w-4 text-gray-400" />
  </button>
</Tooltip>`;

export function TooltipSection() {
  return (
    <Section
      id="tooltip"
      title="Tooltip"
      intro="A lightweight hover/focus label for a trigger element. CSS-driven (no portal); shows on hover and keyboard focus."
    >
      <ImplementationMeta
        id="tooltip"
        note="In progress: new shared component replacing ad-hoc title attributes. For rich/interactive overlays use a Popover instead."
      />

      <Subsection title="Live implementation" description="Hover or tab to the triggers.">
        <PreviewBox className="flex items-center gap-8">
          <Tooltip content="Estimated from declared value">
            <button type="button" aria-label="Fee info" className="text-gray-400 hover:text-gray-600">
              <IconInfoCircle className="h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content="Opens the export dialog" side="bottom">
            <Button variant="outline" size="sm">Export</Button>
          </Tooltip>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'The tooltip appears on hover and on keyboard focus (group-focus-within), so keyboard users get it too.',
          'Wrap a focusable trigger (button/link). Give icon-only triggers an aria-label.',
          'Keep content short; don’t put essential-only information in a tooltip.',
          'Don’t put interactive elements inside — the tooltip is non-interactive (pointer-events-none).',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for brief, supplementary hints.', 'Attach to a focusable trigger.', 'Keep the text to a few words.']}
          donts={['Don’t hide essential info only in a tooltip.', 'Don’t put buttons/links inside.', 'Don’t use on non-focusable elements for key info.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
