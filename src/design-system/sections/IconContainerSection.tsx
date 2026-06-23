import { IconTruck, IconWallet, IconBell, IconBuildingStore } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
  Copyable,
} from '../components/DocPrimitives';
import { IconContainer } from '../../app/components/IconContainer';

const CODE = `import { IconContainer } from '@/app/components/IconContainer';
import { IconTruck } from '@tabler/icons-react';

<IconContainer icon={IconTruck} bg="bg-blue-50" color="text-blue-600" size="md" />`;

export function IconContainerSection() {
  return (
    <Section
      id="icon-container"
      title="Icon Container"
      intro="A soft-tinted square that frames an icon at consistent sizes. The building block behind Stat Card icons, list rows, and empty states."
    >
      <ImplementationMeta id="icon-container" note="bg + color are Tailwind classes; sizes are fixed (sm 28 / base 32 / md 40 / lg 44)." />

      <Subsection title="Sizes">
        <PreviewBox className="flex items-end gap-4">
          {(['sm', 'base', 'md', 'lg'] as const).map((s) => (
            <div key={s} className="text-center">
              <IconContainer icon={IconTruck} bg="bg-blue-50" color="text-blue-600" size={s} />
              <p className="mt-1.5 text-xs text-gray-500">{s}</p>
            </div>
          ))}
        </PreviewBox>
      </Subsection>

      <Subsection title="Tones" description="Pair a light background with a matching mid-tone icon color.">
        <PreviewBox className="flex flex-wrap gap-4">
          <IconContainer icon={IconTruck} bg="bg-blue-50" color="text-blue-600" />
          <IconContainer icon={IconWallet} bg="bg-green-50" color="text-green-600" />
          <IconContainer icon={IconBell} bg="bg-orange-50" color="text-orange-600" />
          <IconContainer icon={IconBuildingStore} bg="bg-cyan-50" color="text-cyan-600" />
        </PreviewBox>
      </Subsection>

      <Subsection title="Props">
        <SpecTable
          columns={['Prop', 'Values']}
          rows={[
            [<code key="s">size</code>, "'sm' | 'base' | 'md' | 'lg' (default 'md')"],
            [<code key="b">bg</code>, <>Tailwind bg class · <Copyable value="bg-blue-50" /></>],
            [<code key="c">color</code>, <>Tailwind text class · <Copyable value="text-blue-600" /></>],
            [<code key="r">rounded</code>, "Override radius (default 'rounded-lg')"],
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The framed icon is decorative; convey meaning with adjacent text, not the icon alone.',
          'Keep enough contrast between the tinted background and the icon color.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use tonal bg + color pairs.', 'Use md (40px) for stat/list contexts.', 'Reuse it instead of hand-rolling tinted icon squares.']}
          donts={['Don’t mix unrelated bg/color tones.', 'Don’t rely on it to label anything by itself.', 'Don’t resize via custom classes — use the size prop.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
