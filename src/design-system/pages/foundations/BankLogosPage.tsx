import { useMemo, useState } from 'react';
import { IconDownload, IconSearch, IconX } from '@tabler/icons-react';
import { Section, Subsection } from '../../components/DocPrimitives';
import { DSPage } from '../../layout/DSPage';
import { BANK_LOGOS } from '../../data/bankLogos';

function BankLogosPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANK_LOGOS;
    return BANK_LOGOS.filter(
      (logo) => logo.name.toLowerCase().includes(q) || logo.file.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <DSPage title="Bank Logos">
      <Section
        id="bank-logos"
        title="Bank Logos"
        intro="Official logos of the banks and e-wallet partners currently supported in the GGX payout module. This page is the approved asset reference for product and engineering use — download and use the SVGs as-is. The same set lives on the Bank Logos page of the GGX-SHADCN Figma file."
      >
        {/* Search */}
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search banks by name or filename…"
            aria-label="Search bank logos"
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

        <Subsection
          title={`All logos (${BANK_LOGOS.length})`}
          description="Sorted A–Z by brand name. Each entry downloads the approved SVG with a kebab-case filename."
        >
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">No banks match "{query}".</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((logo) => (
                <div
                  key={logo.file}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{logo.name}</p>
                  <div className="mt-3 flex h-28 items-center justify-center rounded-lg bg-gray-100/80 dark:bg-gray-200">
                    <img
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <code className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">{logo.file}</code>
                    <a
                      href={logo.src}
                      download={logo.file}
                      className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium text-[#0088C9] hover:underline dark:text-blue-400"
                    >
                      Download <IconDownload className="h-3.5 w-3.5" stroke={2} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Subsection>

        <Subsection
          title="Usage guidelines"
          description="How to consume these assets in product surfaces."
        >
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Every SVG has a 150×150 viewBox with a transparent background and the logo centered at its
                natural aspect ratio — render them at a consistent box size and they align automatically.
              </li>
              <li>Do not redraw, recolor, stretch, crop, or restyle a logo; brand appearance must stay intact.</li>
              <li>Place light or white logos on a subtle neutral surface (like the previews above) so they stay visible.</li>
              <li>
                Filenames are lowercase kebab-case and match the entry names here and in Figma — keep them
                unchanged when adding logos to the app so the payout module, Figma, and code stay in sync.
              </li>
            </ul>
          </div>
        </Subsection>
      </Section>
    </DSPage>
  );
}

export { BankLogosPage };
