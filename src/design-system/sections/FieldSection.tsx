import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Field } from '../../app/components/ui/Field';

const CODE = `import { Field } from '@/app/components/ui/Field';

<dl className="grid grid-cols-2 gap-4">
  <Field label="Tracking number" value="GGX-2026-10231" />
  <Field label="Service type" value="Standard Delivery" />
</dl>`;

export function FieldSection() {
  return (
    <Section
      id="field"
      title="Field"
      intro="A read-only label / value pair for detail panels and summaries. Mirrors the GGX-SHADCN Field component (label above, value below)."
    >
      <ImplementationMeta
        id="field"
        note="In progress: this is a new shared component standardizing the app's many ad-hoc label/value blocks (~50 inline uses). Adoption is rolling out; new detail panels should use it."
      />

      <Subsection title="Live implementation" description="Group multiple Fields inside a <dl>.">
        <PreviewBox>
          <dl className="grid max-w-lg grid-cols-2 gap-4">
            <Field label="Tracking number" value="GGX-2026-10231" />
            <Field label="Service type" value="Standard Delivery" />
            <Field label="Recipient" value="Acme Luzon" />
            <Field label="COD amount" value="₱ 1,250.00" />
          </dl>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use for read-only detail/summary data.', 'Wrap groups in a <dl> grid.', 'Keep labels short and consistent.']}
          donts={['Don’t use for editable inputs.', 'Don’t put actions inside a Field.', 'Don’t vary label styling per panel.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders a <dt>/<dd> pair — group Fields inside a <dl> for correct description-list semantics.',
          'The label is the accessible name for its value; keep labels concise.',
          'Display-only: use Input/Form Field for editable values.',
        ]}
      />


    </Section>
  );
}
