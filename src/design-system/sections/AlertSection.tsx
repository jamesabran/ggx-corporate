import { IconInfoCircle, IconAlertTriangle, IconCircleCheck, IconAlertOctagon } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Alert } from '../../app/components/ui/Alert';

const CODE = `import { Alert } from '@/app/components/ui/Alert';
import { IconInfoCircle } from '@tabler/icons-react';

<Alert variant="info" icon={<IconInfoCircle className="h-4 w-4" />} title="Heads up">
  Password resets aren’t available yet.
</Alert>`;

export function AlertSection() {
  return (
    <Section
      id="alert"
      title="Alert"
      intro="An inline banner for contextual messages. Standardizes the rounded callouts used across pages (e.g. the Login help notice) with semantic variants."
    >
      <ImplementationMeta id="alert" note="Variants: info / success / warning / destructive. Title and icon are optional." />

      <Subsection title="Variants">
        <PreviewBox className="space-y-3">
          <Alert variant="info" icon={<IconInfoCircle className="h-4 w-4" />} title="Heads up">
            Password resets aren’t available yet. Email support to regain access.
          </Alert>
          <Alert variant="success" icon={<IconCircleCheck className="h-4 w-4" />}>
            Your payout account was verified.
          </Alert>
          <Alert variant="warning" icon={<IconAlertTriangle className="h-4 w-4" />} title="Action needed">
            3 rows need review before this batch can be booked.
          </Alert>
          <Alert variant="destructive" icon={<IconAlertOctagon className="h-4 w-4" />}>
            This action can’t be undone.
          </Alert>
        </PreviewBox>
      </Subsection>

      <Subsection title="Without icon or title">
        <PreviewBox>
          <Alert variant="info">Plain informational message, no icon or title.</Alert>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Match the variant to the message (info/success/warning/destructive).', 'Keep copy short and specific.', 'Place near the content it concerns.']}
          donts={['Don’t use a destructive alert for routine info.', 'Don’t stack many alerts at the top of a page.', 'Don’t use color as the only signal.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders role="status" so the message is announced politely when it appears.',
          'The icon is decorative; the text carries the meaning (don’t rely on color alone).',
          'For urgent/error messages tied to an action, place the alert next to the relevant control.',
        ]}
      />


    </Section>
  );
}
