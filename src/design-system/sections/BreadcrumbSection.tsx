import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Breadcrumb } from '../../app/components/ui/Breadcrumb';

const CODE = `import { Breadcrumb } from '@/app/components/ui/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Transactions', to: '/dashboard/transactions' },
    { label: 'GGX-2026-10231' },
  ]}
/>`;

export function BreadcrumbSection() {
  return (
    <Section
      id="breadcrumb"
      title="Breadcrumb"
      intro="A navigation trail showing the path to the current page. Earlier items link back; the last item is the current page."
    >
      <ImplementationMeta
        id="breadcrumb"
        note="In progress: new shared component for detail pages. Earlier crumbs link via react-router; the last crumb is plain text."
      />

      <Subsection title="Live implementation">
        <PreviewBox className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Transactions', to: '/dashboard/transactions' },
              { label: 'GGX-2026-10231' },
            ]}
          />
          <Breadcrumb
            items={[
              { label: 'Account', to: '/dashboard/settings' },
              { label: 'Subaccounts', to: '/dashboard/subaccounts' },
              { label: 'Acme Luzon' },
            ]}
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use on nested detail pages to show context.', 'Make every crumb except the last a link.', 'Keep labels short (use IDs/names, not full paths).']}
          donts={['Don’t link the current page.', 'Don’t use breadcrumbs on top-level pages.', 'Don’t duplicate the page title as the only crumb.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Wrapped in <nav aria-label="Breadcrumb">.',
          'The current page is marked with aria-current="page" and isn’t a link.',
          'Separators are decorative chevrons (not announced as content).',
        ]}
      />


    </Section>
  );
}
