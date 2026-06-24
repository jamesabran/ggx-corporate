import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Separator } from '../../app/components/ui/Separator';

const CODE = `import { Separator } from '@/app/components/ui/Separator';

<Separator />                       // horizontal (default)
<Separator orientation="vertical" /> // vertical
<Separator className="bg-gray-100" /> // lighter hairline`;

export function SeparatorSection() {
  return (
    <Section
      id="separator"
      title="Separator"
      intro="A thin divider line that standardizes the ad-hoc border dividers used across pages into one semantic element."
    >
      <ImplementationMeta id="separator" note="Defaults to a full-width horizontal hairline. Override color/spacing via className (e.g. bg-gray-100, my-3)." />

      <Subsection title="Orientations">
        <PreviewBox className="space-y-4">
          <div>
            <p className="text-sm text-gray-700">Section one</p>
            <Separator className="my-3" />
            <p className="text-sm text-gray-700">Section two</p>
          </div>
          <div className="flex h-6 items-center gap-3 text-sm text-gray-700">
            <span>Deliveries</span>
            <Separator orientation="vertical" />
            <span>Store Orders</span>
            <Separator orientation="vertical" />
            <span>Returns</span>
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use to separate groups of related content.', 'Use the vertical orientation inside a flex row.', 'Keep it subtle (gray hairline).']}
          donts={['Don’t use multiple separators where whitespace would do.', 'Don’t use as a heavy visual element.', 'Don’t wrap content in it.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders role="separator" with aria-orientation so assistive tech announces the divide.',
          'Purely visual structure — it holds no content and isn’t focusable.',
        ]}
      />


    </Section>
  );
}
