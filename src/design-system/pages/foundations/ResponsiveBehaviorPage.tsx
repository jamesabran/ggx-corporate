import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, SpecTable, CodeBlock } from '../../components/DocPrimitives';

const BREAKPOINTS = [
  { prefix: '(none)', min: '0px',    label: 'Mobile',  notes: 'Single-column layouts, stacked cards, full-width inputs' },
  { prefix: 'sm:',   min: '640px',   label: 'Small',   notes: 'Two-column grids, side-by-side form fields' },
  { prefix: 'md:',   min: '768px',   label: 'Medium',  notes: 'Expanded content areas, filter bars, multi-column stat grids' },
  { prefix: 'lg:',   min: '1024px',  label: 'Large',   notes: 'Desktop sidebar appears, header nav links visible' },
  { prefix: 'xl:',   min: '1280px',  label: 'XL',      notes: 'Right TOC sidebar appears in Design System reference' },
  { prefix: '2xl:',  min: '1536px',  label: '2XL',     notes: 'Rarely used; widest content shells' },
];

export function ResponsiveBehaviorPage() {
  return (
    <DSPage title="Responsive behavior">
      <Section
        id="breakpoints"
        title="Breakpoints"
        intro="GGX Corporate uses Tailwind's default breakpoint scale with a mobile-first approach — all base styles apply at mobile width; breakpoint prefixes add progressively wider layouts."
      >
        <SpecTable
          columns={['Prefix', 'Min-width', 'Name', 'GGX usage']}
          rows={BREAKPOINTS.map((b) => [
            <code key={b.prefix} className="font-mono text-xs">{b.prefix}</code>,
            <code key={b.prefix + 'm'} className="font-mono text-xs">{b.min}</code>,
            b.label,
            b.notes,
          ])}
        />
      </Section>

      <Section
        id="layout-patterns"
        title="Layout patterns"
      >
        <Subsection title="Dashboard shell">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The main app uses a fixed sidebar on <code className="font-mono text-xs">lg+</code> and a hamburger drawer on mobile.
            The content area is full-width at mobile and padded at desktop (<code className="font-mono text-xs">lg:pl-64</code>).
          </p>
        </Subsection>
        <Subsection title="Stat card grids">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stat cards start as a single column, moving to 2 columns at <code className="font-mono text-xs">sm:</code> and 4 columns at <code className="font-mono text-xs">lg:</code>.
          </p>
          <CodeBlock code={`<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard ... />
  <StatCard ... />
</div>`} />
        </Subsection>
        <Subsection title="Form layouts">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Forms are single-column at mobile. Related fields (e.g., first/last name) go side-by-side at <code className="font-mono text-xs">sm:</code> using <code className="font-mono text-xs">grid-cols-2</code>.
            Full-width CTAs on mobile, auto-width on desktop.
          </p>
        </Subsection>
        <Subsection title="Tables">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tables are wrapped in <code className="font-mono text-xs">overflow-x-auto</code> at all sizes. On mobile,
            lower-priority columns can be hidden with <code className="font-mono text-xs">hidden sm:table-cell</code>.
          </p>
        </Subsection>
      </Section>

      <Section id="mobile-first" title="Mobile-first rule">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          All styles are written mobile-first. This means: write the mobile style first with no prefix,
          then add <code className="font-mono text-xs">sm:</code> / <code className="font-mono text-xs">md:</code> / <code className="font-mono text-xs">lg:</code> overrides for wider viewports.
          Avoid <code className="font-mono text-xs">max-md:</code> (max-width) prefixes unless genuinely required — they fight the default direction.
        </p>
        <CodeBlock code={`// Correct — mobile first
<div className="w-full sm:w-auto">...</div>

// Avoid — inverted direction
<div className="w-auto max-sm:w-full">...</div>`} />
      </Section>
    </DSPage>
  );
}
