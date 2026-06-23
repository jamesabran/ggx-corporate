import { Section, Subsection, Copyable } from '../components/DocPrimitives';
import { ICON_CATEGORIES, CUSTOM_ASSETS, ASSET_IMPORT_HINT } from '../data/icons';

export function IconsSection() {
  return (
    <Section
      id="icons"
      title="Icons"
      intro="Line icons come from @tabler/icons-react (the app's icon set), grouped by where they're used. Illustrated assets are the existing Basic UI PNGs, reused in place."
    >
      {ICON_CATEGORIES.map((cat) => (
        <Subsection key={cat.id} title={cat.title} description={<code className="font-mono text-xs">import {'{ … }'} from '{cat.importFrom}'</code>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cat.icons.map(({ icon: Icon, name, usage }) => (
              <div key={name} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <Icon className="h-6 w-6 flex-shrink-0 text-gray-700" stroke={1.8} />
                <div className="min-w-0">
                  <code className="block truncate font-mono text-xs text-gray-800">{name}</code>
                  <p className="text-[11px] text-gray-500">{usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Subsection>
      ))}

      <Subsection
        title="Custom / illustrated assets"
        description="Existing 3D-style Basic UI assets, reused from src/assets/basic/ without moving or duplicating them."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CUSTOM_ASSETS.map((a) => (
            <div key={a.name} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <img src={a.src} alt={a.name} className="h-10 w-10 flex-shrink-0 object-contain" />
              <div className="min-w-0">
                <code className="block truncate font-mono text-xs text-gray-800">{a.name}</code>
                <p className="text-[11px] text-gray-500">{a.category} · {a.usage}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          Import: <Copyable value={ASSET_IMPORT_HINT} />
        </div>
      </Subsection>
    </Section>
  );
}
