import { IconLoader2, IconPlus } from '@tabler/icons-react';
import { Section, Subsection, PreviewBox, CodeBlock, DoDont, SourceNote, SpecTable } from '../components/DocPrimitives';
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

      <Subsection title="States" description="Disabled drops to 50% opacity and blocks pointer events. Show a spinner for in-flight actions.">
        <PreviewBox className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button disabled>
            <IconLoader2 className="h-4 w-4 animate-spin" /> Loading
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
        <div className="mt-3">
          <SourceNote path="src/app/components/ui/Button.tsx" />
        </div>
      </Subsection>
    </Section>
  );
}
