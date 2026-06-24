import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Avatar } from '../../app/components/ui/Avatar';

const CODE = `import { Avatar } from '@/app/components/ui/Avatar';

<Avatar initials="AL" shape="square" size="base" />
<Avatar initials="BR" shape="circle" size="md" />
<Avatar src="/me.jpg" alt="Maria Santos" />`;

export function AvatarSection() {
  return (
    <Section
      id="avatar"
      title="Avatar"
      intro="Represents an account or user with gradient initials (or an image). Extracted from the RootLayout topbar and account switcher; square and circle variants mirror GGX-SHADCN."
    >
      <ImplementationMeta id="avatar" note="Falls back to initials when no src is given. Shapes: circle (users) and square (accounts)." />

      <Subsection title="Shapes & sizes">
        <PreviewBox className="flex items-end gap-6">
          <div className="flex items-end gap-3">
            {(['sm', 'base', 'md', 'lg'] as const).map((s) => (
              <div key={s} className="text-center">
                <Avatar initials="AL" shape="circle" size={s} />
                <p className="mt-1.5 text-xs text-gray-500">{s}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-3">
            <Avatar initials="GG" shape="square" size="md" />
            <Avatar initials="BR" shape="square" size="lg" />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use square for accounts, circle for people.', 'Show the name next to the avatar.', 'Use 2-letter initials.']}
          donts={['Don’t rely on the avatar alone to identify an entity.', 'Don’t stretch non-square images (it crops to fill).', 'Don’t invent new sizes via ad-hoc classes.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Initials are decorative shorthand — always show the full name nearby (the avatar shouldn’t be the only identifier).',
          'When using an image, pass a meaningful alt; the initials fallback has no alt (it’s decorative).',
          'Keep enough contrast — white initials on the blue gradient meet contrast at these sizes.',
        ]}
      />


    </Section>
  );
}
