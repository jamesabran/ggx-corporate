import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Section, Subsection, CopyButton, Copyable } from '../../components/DocPrimitives';
import { DSPage } from '../../layout/DSPage';
import { ICON_CATEGORIES, CUSTOM_ASSETS, ASSET_IMPORT_HINT } from '../../data/icons';

function IconsPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_CATEGORIES;
    return ICON_CATEGORIES
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(q) ||
            icon.usage.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.icons.length > 0);
  }, [query]);

  const totalCount = ICON_CATEGORIES.reduce((n, c) => n + c.icons.length, 0) + CUSTOM_ASSETS.length;

  return (
    <DSPage title="Icons">
      <Section
        id="icons"
        title="Icons"
        intro={`Line icons from @tabler/icons-react (${totalCount - CUSTOM_ASSETS.length} icons), plus illustrated custom assets. Grouped by context.`}
      >
        {/* Search */}
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons by name or usage…"
            aria-label="Search icons"
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0088C9]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <IconX className="h-4 w-4" />
            </button>
          )}
        </div>

        {query && filteredCategories.length === 0 && (
          <p className="text-sm text-gray-400">No icons match "{query}".</p>
        )}

        {/* Tabler icon categories */}
        {filteredCategories.map((cat) => (
          <Subsection
            key={cat.id}
            title={cat.title}
            description={
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                Import from{' '}
                <Copyable value={cat.importFrom} />
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.icons.map(({ icon: Icon, name, usage }) => (
                <div
                  key={name}
                  className="group flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:bg-gray-50/60"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-gray-700 mt-0.5" stroke={1.8} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <code className="block truncate font-mono text-[11px] text-gray-800">{name}</code>
                      <CopyButton
                        value={`<${name} className="h-5 w-5" stroke={1.8} />`}
                        label={`Copy ${name} snippet`}
                        className="opacity-0 group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">{usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </Subsection>
        ))}

        {/* Custom illustrated assets */}
        {(!query || CUSTOM_ASSETS.some((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.usage.toLowerCase().includes(query.toLowerCase()))) && (
          <Subsection
            title="Custom / illustrated assets"
            description="3D-style PNG assets from src/assets/basic/ — reused without moving or duplicating them."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {CUSTOM_ASSETS
                .filter((a) =>
                  !query ||
                  a.name.toLowerCase().includes(query.toLowerCase()) ||
                  a.usage.toLowerCase().includes(query.toLowerCase()),
                )
                .map((a) => (
                  <div
                    key={a.name}
                    className="group flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:bg-gray-50/60"
                  >
                    <img src={a.src} alt={a.name} className="h-10 w-10 flex-shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <code className="block truncate font-mono text-[11px] text-gray-800">{a.name}</code>
                        <CopyButton
                          value={`import ${a.name.replace('.png', '').replace(/-(\w)/g, (_, c) => c.toUpperCase())} from 'src/assets/basic/${a.name}';`}
                          label={`Copy import for ${a.name}`}
                          className="opacity-0 group-hover:opacity-100"
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500">{a.category} · {a.usage}</p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              Import pattern: <Copyable value={ASSET_IMPORT_HINT} />
            </div>
          </Subsection>
        )}

        {/* Usage note */}
        <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-1">Icons on other pages</p>
          <p>Component and pattern pages show only icons directly relevant to that component. Use this page as the full approved inventory. For new icons, prefer Tabler icons that are already used in a similar context — check the categories above before picking something new.</p>
          <p className="mt-2 text-xs text-gray-400">
            More Tabler icons at{' '}
            <a
              href="https://tabler.io/icons"
              target="_blank"
              rel="noreferrer"
              className="text-[#0088C9] hover:underline"
            >
              tabler.io/icons
            </a>{' '}
            — import from <code className="font-mono">@tabler/icons-react</code>.
          </p>
        </div>
      </Section>
    </DSPage>
  );
}

export { IconsPage };
