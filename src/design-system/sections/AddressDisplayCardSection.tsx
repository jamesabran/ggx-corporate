import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Card, CardContent } from '../../app/components/ui/Card';
import { AddressDisplayCard } from '../../app/components/AddressDisplayCard';
import { CompactAddressCard } from '../../app/components/CompactAddressCard';
import type { Address } from '../../app/components/AddressBook';

// Sample data fed to the real components (presentation only).
const SAMPLE: Address = {
  id: 'addr-1',
  label: 'warehouse',
  name: 'Acme Luzon — Main Hub',
  mobileNumber: '0917 555 0142',
  province: 'Metro Manila',
  city: 'Quezon City',
  barangay: 'Bagumbayan',
  otherDetails: 'Gate 3, Bldg A',
  isPreferred: true,
  postalCode: '1110',
};

const CODE = `import { AddressDisplayCard } from '@/app/components/AddressDisplayCard';
import { Card, CardContent } from '@/app/components/ui/Card';

<Card>
  <CardContent className="p-4">
    <AddressDisplayCard address={address} />
  </CardContent>
</Card>`;

export function AddressDisplayCardSection() {
  return (
    <Section
      id="address-display-card"
      title="Address Display Card"
      intro="A display-only address block — label badge, recipient, contact, and formatted address line — shared between the Address Book and Settings. A compact variant adds an inline Change action for forms."
    >
      <ImplementationMeta id="address-display-card" note="AddressDisplayCard is display-only (wrap it in a Card at the call site). CompactAddressCard is the inline form variant with a Change action." />

      <Subsection title="Full variant" description="Wrap in a Card/CardContent (the component is content-only).">
        <PreviewBox>
          <Card className="max-w-sm">
            <CardContent className="p-4">
              <AddressDisplayCard address={SAMPLE} />
            </CardContent>
          </Card>
        </PreviewBox>
      </Subsection>

      <Subsection title="Compact variant" description="Inline address with a Change action, for form contexts (e.g. Operations Requests).">
        <PreviewBox>
          <div className="max-w-md">
            <CompactAddressCard address={SAMPLE} onChangeClick={() => {}} />
          </div>
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Use the full variant for read-only address panels.', 'Use the compact variant inside forms needing a Change action.', 'Wrap the full variant in a Card.']}
          donts={['Don’t add actions to the full display variant.', 'Don’t duplicate address formatting elsewhere — reuse this.', 'Don’t rely on the badge color alone for the label.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'Display-only content; the label badge conveys type by text, not color alone.',
          'In the compact variant, the Change control is a real button with an accessible label.',
          'Keep the address line readable; the map-pin icon is decorative.',
        ]}
      />


    </Section>
  );
}
