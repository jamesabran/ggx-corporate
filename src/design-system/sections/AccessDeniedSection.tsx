import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { AccessDenied } from '../../app/components/AccessDenied';

const CODE = `import { AccessDenied } from '@/app/components/AccessDenied';

// Rendered automatically by AdminRoute for manager-role users:
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <AccessDenied />;
  return <>{children}</>;
}

// For custom placements render it directly:
<AccessDenied />`;

export function AccessDeniedSection() {
  return (
    <Section
      id="access-denied"
      title="Access Denied"
      intro="Role-based access block shown when a manager-role user navigates to a parent-account (Admin) only route. Fixed copy — no props."
    >
      <ImplementationMeta id="access-denied" note="Rendered automatically by AdminRoute. No props." />

      <Subsection title="Live render">
        <PreviewBox>
          <AccessDenied />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use AdminRoute to apply the guard — do not place AccessDenied manually in every admin page.',
            'Keep the message fixed; do not customise it per page.',
          ]}
          donts={[
            'Don\'t use AccessDenied for feature-gated modules — use EnablementGate instead.',
            'Don\'t render it inside a full-page loading spinner; show it as the resolved state.',
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The heading "Access restricted" announces the blocked state to screen readers.',
          'The Back to Dashboard button is a native button that navigates on click.',
          'The lock icon is decorative; the text conveys the restriction.',
        ]}
      />
    </Section>
  );
}
