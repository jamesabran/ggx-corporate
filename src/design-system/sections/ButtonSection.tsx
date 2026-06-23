import { IconLoader2, IconPlus } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { Button } from '@/app/components/ui/Button';

<Button>Book delivery</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost">Cancel</Button>
<Button disabled>Unavailable</Button>`;

export function ButtonSection() {
  return (
    <Section
      id="button"
      title="Button"
      intro="The shared Button drives every call to action. It follows the GGX CTA hierarchy: one primary (blue) action per view, secondary and ghost for supporting actions."
    >
      <ImplementationMeta
        status="production"
        source="src/app/components/ui/Button.tsx"
        usedIn={[
          { label: 'Across the dashboard', where: '/dashboard/*' },
          { label: 'RootLayout (logout, nav)', where: 'layouts/RootLayout.tsx' },
        ]}
        note="The previews below import and render this exact component — no copy."
      />

      <Subsection title="Live implementation" description="Rendered from the production Button. Toggle the preview width.">
        <ResponsivePreview>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Book delivery</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Variants" description="Primary for the main action; secondary and ghost for lower-emphasis choices; link for inline navigation.">
        <PreviewBox className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </PreviewBox>
      </Subsection>

      <Subsection title="Sizes">
        <PreviewBox className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add"><IconPlus className="h-4 w-4" /></Button>
        </PreviewBox>
      </Subsection>

      <Subsection
        title="States & interaction"
        description="The component ships default + disabled (native). There is no loading prop — a busy action is composed by placing a spinner in the children and setting disabled."
      >
        <PreviewBox className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button disabled>
            <IconLoader2 className="h-4 w-4 animate-spin" /> Saving…
          </Button>
        </PreviewBox>
      </Subsection>

      <Subsection title="Variant reference">
        <SpecTable
          columns={['Variant', 'Use']}
          rows={[
            [<code key="d">default</code>, 'Primary CTA — the one main action per view.'],
            [<code key="s">secondary</code>, 'Supporting action beside the primary.'],
            [<code key="o">outline</code>, 'Neutral action on white surfaces.'],
            [<code key="g">ghost</code>, 'Low-emphasis / toolbar actions.'],
            [<code key="l">link</code>, 'Inline navigational action.'],
            [<code key="x">destructive</code>, 'Irreversible / dangerous action.'],
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Renders a native <button>; Enter and Space activate it and it is in the tab order by default.',
          <>Focus shows a visible ring (<code>focus-visible:ring-2 ring-primary</code> with an offset).</>,
          'Disabled sets the native disabled attribute — removed from the tab order and pointer events blocked, at 50% opacity.',
          <>Icon-only buttons (<code>size="icon"</code>) must pass an <code>aria-label</code>, as shown in the Sizes example.</>,
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Use exactly one primary button per view or card.',
            'Pair a primary with a secondary or ghost, not two primaries.',
            'Keep labels short and action-led ("Book delivery", "Save").',
          ]}
          donts={[
            'Don’t stack multiple primary buttons competing for attention.',
            'Don’t replace the shared Button with bespoke per-page buttons.',
            'Don’t use destructive styling for routine actions.',
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
