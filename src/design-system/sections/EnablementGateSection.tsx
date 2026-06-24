import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  SpecTable,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { EnablementGate } from '../../app/components/EnablementGate';

const CODE = `import { EnablementGate } from '@/app/components/EnablementGate';

// In a feature page — check the feature flag, show gate when inactive:
export function InventoryPage() {
  const featureEnabled = useFeatureState('inventory');
  if (!featureEnabled) return <EnablementGate moduleId="inventory" />;
  return <InventoryContent />;
}`;

export function EnablementGateSection() {
  return (
    <Section
      id="enablement-gate"
      title="Enablement Gate"
      intro="Status-aware access gate for gated feature modules (Inventory, Storefront, Custom Reports). Resolves the module's access status and CTA from the service and shows a status-appropriate message."
    >
      <ImplementationMeta
        id="enablement-gate"
        note="Relies on useModuleAccessContext. Renders as null while the module status resolves (async mock service). Used on Inventory, Storefront, and Custom Reports pages."
      />

      <Subsection
        title="Inventory — available to activate"
        description="Standard account, self-enable module not yet activated. The live preview resolves from the current demo context."
      >
        <PreviewBox>
          <EnablementGate moduleId="inventory" />
        </PreviewBox>
      </Subsection>

      <Subsection
        title="Custom Reports — requires contract revision"
        description="Contract-gated module; activation requires a contract update."
      >
        <PreviewBox>
          <EnablementGate moduleId="custom_reports" />
        </PreviewBox>
      </Subsection>

      <Subsection title="Status messages reference">
        <SpecTable
          columns={['Status', 'Trigger', 'CTA direction']}
          rows={[
            ['available_to_activate', 'Self-enable module, not yet on', 'Account Add-ons → enable'],
            ['requires_setup', 'Enabled by contract, setup incomplete', 'Account Add-ons → setup'],
            ['included', 'Contract-included, not configured', 'Account Add-ons → configure'],
            ['requires_approval', 'Approval-gated module', 'Account Add-ons → request'],
            ['requires_contract_revision', 'Contract-gated module', 'Account Add-ons → request update'],
            ['requires_dependency', 'Depends on another disabled module', 'Account Add-ons → enable dependency'],
            ['not_available', 'Not available for this account type/region', 'No CTA (disabled)'],
            ['coming_soon', 'Coming soon', 'No CTA (disabled)'],
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Check the feature flag in the page, then pass the module\'s known id string.',
            'Keep EnablementGate as the full page replacement — do not embed it in a partial.',
            'Let the component resolve its own CTA label from the service; do not override it.',
          ]}
          donts={[
            'Don\'t use EnablementGate for role-based restrictions — use AccessDenied / AdminRoute.',
            'Don\'t show EnablementGate while a feature is loading; wait until the feature state is resolved.',
            'Don\'t duplicate the status messages — they live in businessModulesService.',
          ]}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Heading announces the module name. The status message and CTA label are conveyed in text.',
          'The lock icon is decorative; the message text describes the restriction.',
          'The CTA button is disabled (native disabled attribute) when activation is blocked.',
          'The back link to Account Add-ons is a button with visible label.',
        ]}
      />
    </Section>
  );
}
