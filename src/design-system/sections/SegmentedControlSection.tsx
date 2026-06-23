import { useState } from 'react';
import { IconLayoutGrid, IconList, IconPackage, IconBuildingStore } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { SegmentedControl } from '../../app/components/SegmentedControl';

const CODE = `import { SegmentedControl } from '@/app/components/SegmentedControl';

const [view, setView] = useState('deliveries');

<SegmentedControl
  value={view}
  onChange={setView}
  segments={[
    { value: 'deliveries', label: 'Deliveries', icon: IconPackage },
    { value: 'store', label: 'Store Orders', icon: IconBuildingStore },
  ]}
/>`;

export function SegmentedControlSection() {
  const [view, setView] = useState('deliveries');
  const [layout, setLayout] = useState('grid');

  return (
    <Section
      id="segmented-control"
      title="Segmented Control"
      intro="A compact toggle for switching between two or more mutually exclusive views. The active segment becomes a white pill; segments can carry an optional icon."
    >
      <ImplementationMeta id="segmented-control" note="Controlled: pass value + onChange. Generic over the value union for type-safe segment keys." />

      <Subsection title="With labels + icons">
        <PreviewBox className="flex flex-wrap gap-6">
          <SegmentedControl
            value={view}
            onChange={setView}
            segments={[
              { value: 'deliveries', label: 'Deliveries', icon: IconPackage },
              { value: 'store', label: 'Store Orders', icon: IconBuildingStore },
            ]}
          />
          <SegmentedControl
            value={layout}
            onChange={setLayout}
            segments={[
              { value: 'grid', label: 'Grid', icon: IconLayoutGrid },
              { value: 'list', label: 'List', icon: IconList },
            ]}
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Labels only">
        <PreviewBox>
          <SegmentedControl
            value={view}
            onChange={setView}
            segments={[
              { value: 'deliveries', label: 'Deliveries' },
              { value: 'store', label: 'Store Orders' },
            ]}
          />
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Each segment is a native <button> — reachable by Tab and activated with Enter/Space.',
          'The active segment is shown with a filled pill and shadow, not color alone.',
          'For many options or long labels, prefer Tabs or a Select instead.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for 2–4 mutually exclusive views.', 'Keep segment labels short.', 'Use icons to reinforce, not replace, labels.']}
          donts={['Don’t use for more than ~4 options.', 'Don’t use for multi-select.', 'Don’t use for primary page navigation — that’s Tabs/sidebar.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
