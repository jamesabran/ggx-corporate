import { Section, Subsection } from '../components/DocPrimitives';
import { Card } from '../../app/components/ui/Card';

const SPACING = [
  { token: '1', px: '4px', use: 'Tight icon/text gaps.' },
  { token: '2', px: '8px', use: 'Compact stacks, badge padding.' },
  { token: '3', px: '12px', use: 'Control padding, small gaps.' },
  { token: '4', px: '16px', use: 'Default card/content padding.' },
  { token: '6', px: '24px', use: 'Card padding (p-6), section gaps.' },
  { token: '8', px: '32px', use: 'Between major sections.' },
];

const RADII = [
  { name: 'sm', cls: 'rounded-sm', note: '--radius − 4px' },
  { name: 'md', cls: 'rounded-md', note: '--radius − 2px' },
  { name: 'lg', cls: 'rounded-lg', note: '--radius (0.625rem)' },
  { name: 'xl', cls: 'rounded-xl', note: '--radius + 4px (cards)' },
];

export function SpacingSection() {
  return (
    <Section
      id="spacing"
      title="Spacing & Layout"
      intro="A 4px-based spacing scale (Tailwind units), with rounded-xl cards and consistent p-6 padding as the default container convention."
    >
      <Subsection title="Spacing scale" description="Tailwind spacing units. Multiply by 4px for the pixel value.">
        <div className="space-y-2">
          {SPACING.map((s) => (
            <div key={s.token} className="flex items-center gap-4">
              <code className="w-8 font-mono text-xs text-gray-500">{s.token}</code>
              <div className="h-3 rounded bg-[#0088C9]" style={{ width: s.px }} />
              <span className="w-12 text-xs text-gray-500">{s.px}</span>
              <span className="text-xs text-gray-600">{s.use}</span>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection title="Corner radius" description="Cards use rounded-xl; controls and inputs use rounded-lg.">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r.name} className="text-center">
              <div className={`h-16 w-16 border border-gray-300 bg-blue-50 ${r.cls}`} />
              <p className="mt-1.5 text-xs font-medium text-gray-700">{r.name}</p>
              <p className="font-mono text-[10px] text-gray-400">{r.note}</p>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection title="Card convention" description="The standard surface: white, rounded-xl, hairline border, subtle shadow, p-6 content.">
        <Card className="max-w-md p-6">
          <p className="text-sm font-semibold text-gray-900">Card title</p>
          <p className="mt-1 text-sm text-gray-600">
            Cards group related content. Default padding is p-6 with space-y-1.5 in headers.
          </p>
        </Card>
      </Subsection>
    </Section>
  );
}
