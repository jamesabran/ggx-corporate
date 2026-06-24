import { IconPackage, IconTrendingUp, IconClock, IconCash } from '@tabler/icons-react';
import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { StatCard } from '../../app/components/StatCard';

const CODE = `import { StatCard } from '@/app/components/StatCard';
import { IconPackage } from '@tabler/icons-react';

<StatCard
  label="Total shipments"
  value="1,284"
  sub="+8% vs last week"
  icon={IconPackage}
  iconBg="bg-blue-50"
  iconColor="text-blue-600"
/>`;

export function StatCardSection() {
  return (
    <Section
      id="stat-card"
      title="Stat Card"
      intro="The KPI card used across secondary pages: a label, a prominent value, an optional sub-line, and a soft-tinted icon. Composes Card + Icon Container."
    >
      <ImplementationMeta id="stat-card" note="iconBg/iconColor are passed as Tailwind classes; keep the pairing tonal (e.g. bg-blue-50 + text-blue-600)." />

      <Subsection title="Live implementation" description="Real StatCard instances. Resize to see the grid reflow.">
        <ResponsivePreview>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total shipments" value="1,284" sub="+8% vs last week" icon={IconPackage} iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard label="Delivered" value="1,102" sub="85.8% success" icon={IconTrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
            <StatCard label="Awaiting payment" value="46" sub="₱ 88,200 pending" icon={IconClock} iconBg="bg-orange-50" iconColor="text-orange-600" />
            <StatCard label="COD collected" value="₱ 642,310" icon={IconCash} iconBg="bg-cyan-50" iconColor="text-cyan-600" valueColor="text-[#0088C9]" />
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use on secondary/overview pages for KPIs.', 'Keep labels short and values formatted.', 'Pair tonal icon background + color.']}
          donts={['Don’t use for the vibrant full-bleed Dashboard/Earnings hero cards (those are intentional).', 'Don’t overload with more than a short sub-line.', 'Don’t mix unrelated icon/color tones.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Label and value are plain text, read in order — no special roles needed.',
          'The icon is decorative; the label states what the value means.',
          'Use tabular-nums (built in) so values align — already handled by the component.',
        ]}
      />


    </Section>
  );
}
