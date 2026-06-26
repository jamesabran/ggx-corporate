import {
  Section,
  Subsection,
  CopyButton,
} from '../components/DocPrimitives';

const RADIUS_TOKENS = [
  { name: 'sm', css: 'calc(var(--radius) - 4px)', px: '6px', usage: 'Badges, chips, small controls.' },
  { name: 'md', css: 'calc(var(--radius) - 2px)', px: '8px', usage: 'Inputs, select menus, small cards.' },
  { name: 'lg (base)', css: 'var(--radius)', px: '10px', usage: 'Cards, dialogs, panels — the default.' },
  { name: 'xl', css: 'calc(var(--radius) + 4px)', px: '14px', usage: 'Feature cards, large callout surfaces.' },
];

const SEMANTIC_COLOR_TOKENS: { token: string; role: string }[] = [
  { token: '--background', role: 'Page and card backgrounds.' },
  { token: '--foreground', role: 'Primary body text.' },
  { token: '--card', role: 'Card surface background.' },
  { token: '--card-foreground', role: 'Text on card surfaces.' },
  { token: '--popover', role: 'Popover and dropdown surface.' },
  { token: '--popover-foreground', role: 'Text inside popovers.' },
  { token: '--primary', role: 'Brand blue — primary CTAs, active nav.' },
  { token: '--primary-foreground', role: 'Text/icons placed on the primary surface.' },
  { token: '--secondary', role: 'Secondary button and control surface.' },
  { token: '--secondary-foreground', role: 'Text on secondary surfaces.' },
  { token: '--muted', role: 'Muted fills, dividers, disabled backgrounds.' },
  { token: '--muted-foreground', role: 'Helper text, captions, placeholders.' },
  { token: '--accent', role: 'Subtle hover/selected highlight.' },
  { token: '--accent-foreground', role: 'Text on accent surfaces.' },
  { token: '--destructive', role: 'Error states, destructive action buttons.' },
  { token: '--destructive-foreground', role: 'Text on destructive surfaces.' },
  { token: '--border', role: 'Default card and control borders.' },
  { token: '--input', role: 'Input control border.' },
  { token: '--input-background', role: 'Input field fill.' },
  { token: '--ring', role: 'Focus ring / outline.' },
  { token: '--chart-1 → --chart-5', role: 'Data visualisation series colors.' },
];

export function DesignTokensSection() {
  return (
    <Section
      id="design-tokens"
      title="Design Tokens"
      intro="Tokens are the single source of truth for spacing, radius, and color values. They live in tokens/tokens.json and are emitted to src/styles/theme.css as CSS custom properties."
    >
      <Subsection
        title="Border radius"
        description="Four derived sizes anchored to the --radius base (10px). Use Tailwind classes rounded-sm / rounded-md / rounded-lg / rounded-xl — do not hard-code pixel values."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-6 font-medium">Name</th>
                <th className="pb-2 pr-6 font-medium">CSS value</th>
                <th className="pb-2 pr-6 font-medium">Resolved px</th>
                <th className="pb-2 font-medium">Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RADIUS_TOKENS.map((r) => (
                <tr key={r.name}>
                  <td className="py-2.5 pr-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 flex-none border border-gray-300 bg-gray-100"
                        style={{ borderRadius: r.px }}
                      />
                      <code className="font-mono text-xs text-gray-700">rounded-{r.name === 'lg (base)' ? 'lg' : r.name}</code>
                    </div>
                  </td>
                  <td className="py-2.5 pr-6">
                    <span className="flex items-center gap-0.5">
                      <code className="font-mono text-xs text-gray-500">{r.css}</code>
                      <CopyButton value={r.css} label={`Copy ${r.name} radius`} />
                    </span>
                  </td>
                  <td className="py-2.5 pr-6">
                    <code className="font-mono text-xs text-gray-500">{r.px}</code>
                  </td>
                  <td className="py-2.5 text-xs text-gray-600">{r.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Subsection>

      <Subsection
        title="Semantic color tokens"
        description="CSS custom properties defined in src/styles/theme.css. Reference them via their Tailwind equivalents (bg-background, text-foreground, etc.) — not raw hex values."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-6 font-medium">Token</th>
                <th className="pb-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SEMANTIC_COLOR_TOKENS.map((t) => (
                <tr key={t.token}>
                  <td className="py-2 pr-6">
                    <span className="flex items-center gap-0.5">
                      <code className="font-mono text-xs text-gray-700">{t.token}</code>
                      <CopyButton value={`var(${t.token})`} label={`Copy ${t.token}`} />
                    </span>
                  </td>
                  <td className="py-2 text-xs text-gray-600">{t.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Subsection>

      <Subsection
        title="Typography"
        description="Inter is the sole font family. Sizes and weights follow Tailwind's default scale."
      >
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <code className="w-40 flex-none font-mono text-xs text-gray-500">font-sans</code>
            <span className="text-gray-700">'Inter', ui-sans-serif, system-ui, sans-serif</span>
          </div>
          <div className="flex gap-3">
            <code className="w-40 flex-none font-mono text-xs text-gray-500">font-weight-medium</code>
            <span className="text-gray-700">500</span>
          </div>
          <div className="flex gap-3">
            <code className="w-40 flex-none font-mono text-xs text-gray-500">font-weight-normal</code>
            <span className="text-gray-700">400</span>
          </div>
          <div className="flex gap-3">
            <code className="w-40 flex-none font-mono text-xs text-gray-500">base font-size</code>
            <span className="text-gray-700">16px</span>
          </div>
        </div>
      </Subsection>
    </Section>
  );
}
