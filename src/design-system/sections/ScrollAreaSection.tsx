import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { ScrollArea } from '../../app/components/ui/ScrollArea';

const CODE = `import { ScrollArea } from '@/app/components/ui/ScrollArea';

<ScrollArea maxHeight={200}>
  {rows.map((r) => <Row key={r.id} {...r} />)}
</ScrollArea>`;

export function ScrollAreaSection() {
  return (
    <Section
      id="scroll-area"
      title="Scroll Area"
      intro="A height-capped scrollable region with a slim, subtle scrollbar. Standardizes the many ad-hoc overflow regions (long lists, menus, panels)."
    >
      <ImplementationMeta
        id="scroll-area"
        note="In progress: new shared component. Set maxHeight; content beyond it scrolls with a thin styled scrollbar."
      />

      <Subsection title="Live implementation" description="Scroll the list below.">
        <PreviewBox className="max-w-sm">
          <ScrollArea maxHeight={180} className="rounded-lg border border-gray-200">
            <ul className="divide-y divide-gray-100">
              {Array.from({ length: 16 }, (_, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="font-mono text-xs text-gray-500">GGX-2026-{10200 + i}</span>
                  <span className="text-gray-700">Recipient {i + 1}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Cap height for long lists inside panels/menus.', 'Keep a visible affordance that more content exists.', 'Use inside popovers/dialogs for long content.']}
          donts={['Don’t nest scroll areas.', 'Don’t cap height so tightly that little is visible.', 'Don’t use for whole-page scrolling.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'A scrollable region is keyboard-scrollable when it contains focusable items or has tabindex.',
          'Don’t hide content solely behind scroll without making it discoverable.',
          'The slim scrollbar still responds to the OS pointer; it doesn’t remove native scrolling.',
        ]}
      />


    </Section>
  );
}
