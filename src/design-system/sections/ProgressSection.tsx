import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Progress } from '../../app/components/ui/Progress';

const CODE = `import { Progress } from '@/app/components/ui/Progress';

<Progress value={72} aria-label="Delivered" />
<Progress value={45} barClassName="bg-green-600" />
<Progress value={88} className="h-2" barClassName="bg-orange-500" />`;

export function ProgressSection() {
  return (
    <Section
      id="progress"
      title="Progress"
      intro="A horizontal proportion / progress bar. Extracted from the inline bars in the Dashboard and analytics. The track is gray-100; the fill defaults to brand blue."
    >
      <ImplementationMeta id="progress" note="value is 0–100 (clamped). Override fill color via barClassName and height via className." />

      <Subsection title="Values & colors">
        <PreviewBox className="max-w-md space-y-4">
          <Progress value={72} aria-label="Delivered" />
          <Progress value={45} barClassName="bg-green-600" aria-label="In transit" />
          <Progress value={88} className="h-2" barClassName="bg-orange-500" aria-label="Pending" />
          <Progress value={20} className="h-2" barClassName="bg-red-500" aria-label="Failed" />
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders role="progressbar" with aria-valuenow / min / max.',
          'Pass an aria-label (or aria-labelledby) so the bar is named.',
          'When the bar encodes a category, pair it with a visible value/label — don’t rely on color alone.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for proportions and completion (0–100).', 'Label the bar.', 'Use semantic fill colors to match meaning.']}
          donts={['Don’t use for indeterminate spinners.', 'Don’t omit the accessible name.', 'Don’t convey meaning by color alone.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
