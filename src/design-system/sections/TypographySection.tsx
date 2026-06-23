import { Section, Subsection } from '../components/DocPrimitives';

const SCALE = [
  { name: 'Heading 1', cls: 'text-3xl font-semibold tracking-tight', spec: '30px / 600', use: 'Page titles.' },
  { name: 'Heading 2', cls: 'text-2xl font-semibold tracking-tight', spec: '24px / 600', use: 'Section headers.' },
  { name: 'Heading 3', cls: 'text-lg font-semibold', spec: '18px / 600', use: 'Card titles, sub-headers.' },
  { name: 'Body', cls: 'text-sm text-gray-700', spec: '14px / 400', use: 'Default body and table text.' },
  { name: 'Label', cls: 'text-sm font-medium text-gray-900', spec: '14px / 500', use: 'Form labels, button text.' },
  { name: 'Helper', cls: 'text-xs text-gray-500', spec: '12px / 400', use: 'Captions, hints, metadata.' },
];

export function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      intro="The product uses Inter across all surfaces. The practical hierarchy below covers headings, body, labels, and helper text — most screens only need these few steps."
    >
      <Subsection title="Typeface" description="Inter, with a system-sans fallback stack. Defined as --font-sans.">
        <div className="rounded-lg border border-gray-200 p-6">
          <p className="text-4xl font-semibold tracking-tight text-gray-900">Inter</p>
          <p className="mt-2 text-sm text-gray-500">
            AaBbCcDdEe 0123456789 — weights 400 (normal), 500 (medium), 600 (semibold).
          </p>
        </div>
      </Subsection>

      <Subsection title="Hierarchy">
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {SCALE.map((row) => (
            <div key={row.name} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className={row.cls}>{row.name}</span>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="text-gray-600">{row.use}</span>
                <code className="font-mono">{row.spec}</code>
              </div>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  );
}
