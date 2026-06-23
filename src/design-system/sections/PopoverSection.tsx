import { IconDotsVertical, IconBell } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Popover } from '../../app/components/ui/Popover';

const CODE = `import { Popover } from '@/app/components/ui/Popover';

<Popover label={<IconDotsVertical className="h-4 w-4" />} align="end">
  <button className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50">Edit</button>
  <button className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50">Duplicate</button>
</Popover>`;

export function PopoverSection() {
  return (
    <Section
      id="popover"
      title="Popover"
      intro="A click-to-open floating panel anchored to a trigger — menus, filters, and small overflow panels. Closes on outside click and Escape."
    >
      <ImplementationMeta
        id="popover"
        note="In progress: new shared component standardizing the app shell's ad-hoc dropdown panels. For a brief hover hint use Tooltip; for a blocking modal use Dialog."
      />

      <Subsection title="Live implementation" description="Click a trigger; click outside or press Escape to close.">
        <PreviewBox className="flex items-center gap-8">
          <Popover
            label={<span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><IconDotsVertical className="h-4 w-4" /></span>}
            align="start"
          >
            <button className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50">Edit</button>
            <button className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50">Duplicate</button>
            <button className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50">Delete</button>
          </Popover>

          <Popover
            label={<span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><IconBell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /></span>}
            align="end"
            className="w-64"
          >
            <p className="px-2 py-1 text-xs font-semibold text-gray-500">Notifications</p>
            <p className="px-2 py-2 text-sm text-gray-700">3 rows need review in your latest batch.</p>
          </Popover>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'The trigger is a button with aria-haspopup="dialog" and aria-expanded.',
          'Closes on outside click and on Escape.',
          'Keep the panel content reachable by keyboard; place focusable items inside.',
          'Use Dialog (not Popover) when the interaction must block the rest of the page.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for menus, filters, and small overflow panels.', 'Align end for right-edge triggers.', 'Keep the panel content compact.']}
          donts={['Don’t put long forms or critical flows in a popover — use Dialog.', 'Don’t nest popovers.', 'Don’t use it for hover-only hints — that’s Tooltip.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
