import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Textarea } from '../../app/components/ui/Textarea';

const CODE = `import { Textarea } from '@/app/components/ui/Textarea';

<label htmlFor="desc" className="text-sm font-medium text-gray-900">Description</label>
<Textarea id="desc" rows={3} placeholder="Short description" />`;

export function TextareaSection() {
  return (
    <Section
      id="textarea"
      title="Textarea"
      intro="Multi-line text input that matches the Input control's border and focus treatment. Extracted from the inline textarea in product/support forms."
    >
      <ImplementationMeta id="textarea" note="Same focus ring and radius as Input; set rows for the default height." />

      <Subsection title="States" description="Default, filled, and disabled.">
        <PreviewBox className="grid max-w-md gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Description</label>
            <Textarea rows={3} placeholder="Short product description" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Notes</label>
            <Textarea rows={3} defaultValue={'Fragile items — handle with care.\nLeave at the front desk.'} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Locked note (disabled)</label>
            <Textarea rows={2} disabled defaultValue="System-generated audit note." />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for free-form, multi-line text.', 'Set a sensible default rows count.', 'Pair with a label and helper/error where needed.']}
          donts={['Don’t use for single-line entry — use Input.', 'Don’t remove the resize affordance unless necessary.', 'Don’t hide the label.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders a native <textarea>; associate a <label> via htmlFor/id.',
          'For validation, mirror the Input field pattern (aria-invalid + aria-describedby).',
          'Focus shows the standard primary ring; disabled uses the native attribute.',
        ]}
      />


    </Section>
  );
}
