import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Badge } from '../../app/components/ui/Badge';

const VARIANTS = ['default', 'secondary', 'outline', 'success', 'info', 'warning', 'danger', 'pending'] as const;

const CODE = `import { Badge } from '@/app/components/ui/Badge';

<Badge>Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Review</Badge>
<Badge variant="danger">Failed</Badge>`;

export function BadgeBaseSection() {
  return (
    <Section
      id="badge"
      title="Badge"
      intro="The base label/tag primitive — a small rounded pill with semantic color variants. The Delivery Status Badge is one domain pattern built on top of it."
    >
      <ImplementationMeta id="badge" note="Use a semantic variant rather than custom colors so meaning stays consistent across the app." />

      <Subsection title="Variants">
        <PreviewBox className="flex flex-wrap items-center gap-2">
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </PreviewBox>
      </Subsection>

      <Subsection title="Variant reference">
        <SpecTable
          columns={['Variant', 'Meaning']}
          rows={[
            [<Badge key="d" variant="default">default</Badge>, 'Neutral label.'],
            [<Badge key="s" variant="secondary">secondary</Badge>, 'Low-emphasis neutral.'],
            [<Badge key="o" variant="outline">outline</Badge>, 'Bordered, no fill.'],
            [<Badge key="su" variant="success">success</Badge>, 'Positive / completed.'],
            [<Badge key="i" variant="info">info</Badge>, 'Informational / in-progress.'],
            [<Badge key="w" variant="warning">warning</Badge>, 'Needs attention.'],
            [<Badge key="da" variant="danger">danger</Badge>, 'Error / failed.'],
            [<Badge key="p" variant="pending">pending</Badge>, 'Awaiting / processing.'],
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'A badge is non-interactive; its text carries the meaning, not color alone.',
          'Keep labels short (one or two words) so the pill stays readable.',
          'For status, prefer a fixed label set over free text to stay consistent.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Pick the variant that matches meaning (success/warning/danger…).', 'Keep badge text concise.', 'Reuse the same variant for the same meaning across pages.']}
          donts={['Don’t use custom one-off colors.', 'Don’t put long sentences in a badge.', 'Don’t rely on color alone to convey status.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
