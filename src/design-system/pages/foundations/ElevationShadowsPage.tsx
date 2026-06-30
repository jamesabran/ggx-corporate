import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, Copyable, SpecTable } from '../../components/DocPrimitives';

const SHADOW_TOKENS = [
  { name: 'shadow-sm',  value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',          usage: 'Subtle lift: input focus rings, small cards' },
  { name: 'shadow',     value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', usage: 'Default card elevation' },
  { name: 'shadow-md',  value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', usage: 'Dropdown menus, popovers' },
  { name: 'shadow-lg',  value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', usage: 'Modals, dialogs, elevated panels' },
  { name: 'shadow-xl',  value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', usage: 'Full-screen overlays, toasts' },
];

const Z_INDEX_LAYERS = [
  { layer: 'Base content', z: '0 (auto)', examples: 'Page content, cards, tables' },
  { layer: 'Sticky header / sidebar', z: '20–30', examples: 'DSLayout header (z-30), sidebars (z-20)' },
  { layer: 'Dropdown / popover', z: '40', examples: 'Select menu, Combobox, Popover' },
  { layer: 'Mobile drawer overlay', z: '40', examples: 'Mobile nav drawer' },
  { layer: 'Dialog / modal', z: '50', examples: 'Dialog, OTP Dialog, search modal' },
  { layer: 'Toast / notification', z: '60', examples: 'Future: global notification layer' },
];

function ShadowSwatch({ shadow, label }: { shadow: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-16 w-full rounded-xl bg-white dark:bg-gray-800"
        style={{ boxShadow: shadow }}
      />
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export function ElevationShadowsPage() {
  return (
    <DSPage title="Elevation & Shadows">
      <Section
        id="shadows"
        title="Shadows"
        intro="Tailwind's default shadow scale as used in GGX. Shadows communicate elevation — use the smallest shadow that communicates the layer relationship clearly."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 p-6 bg-gray-100/60 dark:bg-gray-800/40 rounded-xl">
          <ShadowSwatch shadow="0 1px 2px 0 rgb(0 0 0 / 0.05)" label="shadow-sm" />
          <ShadowSwatch shadow="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" label="shadow" />
          <ShadowSwatch shadow="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" label="shadow-md" />
          <ShadowSwatch shadow="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" label="shadow-lg" />
          <ShadowSwatch shadow="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" label="shadow-xl" />
        </div>

        <SpecTable
          columns={['Token', 'CSS value', 'Usage']}
          rows={SHADOW_TOKENS.map((s) => [
            <Copyable key={s.name} value={s.name} />,
            <code key={s.name + 'v'} className="font-mono text-[11px] text-gray-600 dark:text-gray-400 break-all">{s.value}</code>,
            s.usage,
          ])}
        />
      </Section>

      <Section
        id="z-index"
        title="Z-index layers"
        intro="GGX uses a structured stacking order so overlapping elements always resolve correctly."
      >
        <SpecTable
          columns={['Layer', 'z-index', 'Examples']}
          rows={Z_INDEX_LAYERS.map((l) => [l.layer, <code key={l.layer} className="font-mono text-xs">{l.z}</code>, l.examples])}
        />
      </Section>

      <Section id="usage-guidelines" title="Usage guidelines">
        <Subsection title="Elevation signals depth">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            More shadow = higher in the visual stack. Cards use <code className="font-mono text-xs">shadow-sm</code> or <code className="font-mono text-xs">shadow</code>.
            Dropdowns and popovers use <code className="font-mono text-xs">shadow-md</code>. Full dialogs use <code className="font-mono text-xs">shadow-lg</code>.
            Never apply heavy shadows to inline elements.
          </p>
        </Subsection>
        <Subsection title="Dark mode">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tailwind shadow values are semi-transparent black which reduces naturally on dark backgrounds.
            For GGX dark mode, borders (<code className="font-mono text-xs">border-gray-700</code>) often substitute for shadows to
            maintain legible boundaries without adding harsh dark-mode glows.
          </p>
        </Subsection>
      </Section>
    </DSPage>
  );
}
