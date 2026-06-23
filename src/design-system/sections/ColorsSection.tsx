import { Section, Subsection } from '../components/DocPrimitives';
import { COLOR_GROUPS } from '../data/colors';

export function ColorsSection() {
  return (
    <Section
      id="colors"
      title="Colors"
      intro="The brand blue anchors the palette, supported by light-blue/cyan surfaces, a neutral gray scale, and a semantic set for status. Values mirror the design tokens in styles/theme.css."
    >
      {COLOR_GROUPS.map((group) => (
        <Subsection key={group.id} title={group.title} description={group.description}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.swatches.map((s) => (
              <div key={s.name} className="overflow-hidden rounded-lg border border-gray-200">
                <div className="h-16 w-full" style={{ backgroundColor: s.value }} />
                <div className="space-y-1 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    <code className="font-mono text-xs text-gray-500">{s.value}</code>
                  </div>
                  <code className="block font-mono text-[11px] text-gray-400">{s.token}</code>
                  <p className="text-xs text-gray-600">{s.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Subsection>
      ))}
    </Section>
  );
}
