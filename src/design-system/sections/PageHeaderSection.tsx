import {
  Section,
  Subsection,
  PreviewBox,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { PageHeader } from '../../app/components/ui/PageHeader';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { PageHeader } from '@/app/components/ui/PageHeader';

<PageHeader
  title="Transactions"
  subtitle="Track all your bookings and deliveries"
  action={<Button variant="outline">Export CSV</Button>}
/>`;

export function PageHeaderSection() {
  return (
    <Section
      id="page-header"
      title="Page Header"
      intro="The standard top-of-page header: title and optional subtitle on the left, optional actions on the right. Extracted from the repeated header pattern across dashboard pages."
    >
      <ImplementationMeta id="page-header" note="Stacks vertically on mobile and splits left/right from md up. Pass actions via the action prop." />

      <Subsection title="Live implementation">
        <ResponsivePreview>
          <PageHeader
            title="Transactions"
            subtitle="Track all your bookings and deliveries"
            action={<Button variant="outline">Export CSV</Button>}
          />
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Without actions">
        <PreviewBox>
          <PageHeader title="Settings" subtitle="Manage your account and preferences" />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use once at the top of a page.', 'Keep the title short; use the subtitle for context.', 'Place primary page actions in the action slot.']}
          donts={['Don’t use multiple h1-level headers per page.', 'Don’t overload the action area.', 'Don’t restyle the title per page.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders the page <h1>; keep exactly one PageHeader (one h1) per page.',
          'Action controls keep their own button semantics and focus ring.',
          'Subtitle is supporting text — don’t put essential-only info there.',
        ]}
      />


    </Section>
  );
}
