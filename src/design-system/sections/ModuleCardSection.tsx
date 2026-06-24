import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { ModuleCard } from '../../app/components/ModuleCard';
import type { ResolvedModule } from '../../app/services/businessModulesService';

// Sample ResolvedModule data fed to the real ModuleCard (presentation only).
// Cast through unknown because the full BusinessModuleDef shape is owned by the
// service; the card only reads name/description/status/cta here.
const sample = (over: Record<string, unknown>): ResolvedModule =>
  ({
    def: { id: 'inventory', name: 'Inventory', description: 'Track stock levels for products you sell.' },
    status: 'enabled',
    cta: { label: 'Open', kind: 'open', route: '/dashboard/inventory', disabled: false },
    categoryLabel: 'Commerce',
    availableForLabels: [],
    allowedRoleLabels: [],
    activationBlocked: false,
    requestPending: false,
    ...over,
  }) as unknown as ResolvedModule;

const MODULES: ResolvedModule[] = [
  sample({}),
  sample({
    def: { id: 'storefront', name: 'Storefront', description: 'Sell online with a hosted product page.' },
    status: 'available_to_activate',
    cta: { label: 'Enable Storefront', kind: 'enable', disabled: false },
  }),
  sample({
    def: { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Deeper breakdowns and exports.' },
    status: 'coming_soon',
    cta: { label: 'Coming soon', kind: 'coming_soon', disabled: true },
    categoryLabel: 'Analytics',
  }),
];

const CODE = `import { ModuleCard } from '@/app/components/ModuleCard';

<ModuleCard module={resolvedModule} onAction={(m) => requestActivation(m)} />`;

export function ModuleCardSection() {
  return (
    <Section
      id="module-card"
      title="Module Card"
      intro="A status-aware Account Add-on card: icon, category, name, description, an access-status badge, and a status-driven CTA. Used on the Account Add-ons page."
    >
      <ImplementationMeta id="module-card" note="Status → CTA text is owned by businessModulesService and never re-derived in the card. Open navigates; activation CTAs call onAction." />

      <Subsection title="Live implementation" description="Enabled (Open), available (Enable), and coming-soon (disabled) states.">
        <ResponsivePreview>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <ModuleCard key={m.def.id} module={m} onAction={() => {}} />
            ))}
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Drive status and CTA from the service, not the UI.', 'Use onAction for activation/request flows without a route.', 'Keep one clear CTA per card.']}
          donts={['Don’t hardcode CTA labels in the card.', 'Don’t enable a CTA the user’s role can’t perform.', 'Don’t mix add-on cards with unrelated content cards.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The CTA is the shared Button — keyboard-activatable with a visible focus ring.',
          'Disabled CTAs (coming soon / role-blocked) use the native disabled attribute.',
          'The status badge conveys access by text + variant, not color alone.',
        ]}
      />


    </Section>
  );
}
